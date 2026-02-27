import { AIRecommendation, TopicPerformance } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function getAIRecommendations(
    performances: TopicPerformance[]
): Promise<AIRecommendation> {
    if (!GEMINI_API_KEY) {
        return getMockRecommendations(performances);
    }

    const performanceSummary = performances
        .map((p) => `${p.topicName} (${p.language}): ${p.accuracy.toFixed(0)}% accuracy - ${p.competency}`)
        .join('\n');

    const prompt = `You are an expert programming tutor. Based on the following student performance data, provide personalized learning recommendations.

Student Performance Summary:
${performanceSummary}

Respond in the following JSON format ONLY (no markdown, no code blocks, just raw JSON):
{
  "summary": "A 2-3 sentence overall assessment of the student's performance",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"],
  "studyPlan": "A paragraph describing a recommended study plan for the next week"
}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            if (response.status === 429 || response.status === 503) {
                console.warn(`Gemini API limit reached (${response.status}). Falling back to local recommendations seamlessly.`);
                return getMockRecommendations(performances);
            }
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response, handling potential markdown code blocks
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        return parsed as AIRecommendation;
    } catch (error: any) {
        if (!error?.message?.includes('429') && !error?.message?.includes('503')) {
            console.error('Gemini API error:', error);
        }
        return getMockRecommendations(performances);
    }
}

function getMockRecommendations(performances: TopicPerformance[]): AIRecommendation {
    const strong = performances.filter((p) => p.competency === 'strong');
    const weak = performances.filter((p) => p.competency === 'weak');
    const medium = performances.filter((p) => p.competency === 'medium');

    return {
        summary: `Based on your performance across ${performances.length} topics, you show ${strong.length > 0 ? 'strong proficiency in ' + strong.map(s => s.topicName).join(', ') : 'room for improvement'}. ${weak.length > 0 ? 'Focus on strengthening ' + weak.map(w => w.topicName).join(', ') + '.' : 'Keep up the great work!'}`,
        strengths: strong.length > 0
            ? strong.map((s) => `Strong understanding of ${s.topicName} with ${s.accuracy.toFixed(0)}% accuracy`)
            : ['You are making progress! Keep practicing to build stronger foundations.'],
        weaknesses: weak.length > 0
            ? weak.map((w) => `${w.topicName} needs improvement (${w.accuracy.toFixed(0)}% accuracy)`)
            : medium.length > 0
                ? medium.map((m) => `${m.topicName} could be stronger (${m.accuracy.toFixed(0)}% accuracy)`)
                : ['No significant weaknesses detected. Challenge yourself with harder topics!'],
        recommendations: [
            ...(weak.length > 0
                ? [`Start by reviewing the fundamentals of ${weak[0].topicName}`]
                : []),
            'Practice with adaptive quizzes daily to build consistency',
            'Review incorrect answers to understand the concepts behind them',
            ...(strong.length > 0
                ? [`Try harder difficulty levels in ${strong[0].topicName} to push your limits`]
                : []),
            'Focus on understanding concepts rather than memorizing answers',
        ].slice(0, 4),
        studyPlan: `This week, dedicate time each day to focused practice. ${weak.length > 0 ? `Start with ${weak[0].topicName} for the first two days, focusing on easy and medium difficulty questions. ` : ''}${medium.length > 0 ? `Then move to ${medium[0].topicName} to solidify your intermediate knowledge. ` : ''}${strong.length > 0 ? `End the week by challenging yourself with hard questions in ${strong[0].topicName}. ` : ''}Review any mistakes at the end of each session.`,
    };
}
