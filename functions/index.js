/**
 * Firebase Cloud Function for Gemini AI Recommendations
 * 
 * For production deployment, move the Gemini API call to this Cloud Function
 * to keep the API key secure on the server side.
 * 
 * Setup:
 * 1. cd functions
 * 2. npm install
 * 3. firebase functions:config:set gemini.api_key="YOUR_API_KEY"
 * 4. firebase deploy --only functions
 */

const functions = require('firebase-functions');
const fetch = require('node-fetch');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

exports.getRecommendations = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to get recommendations.'
        );
    }

    const { performances } = data;

    if (!performances || !Array.isArray(performances)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Performance data is required.'
        );
    }

    const apiKey = functions.config().gemini?.api_key;
    if (!apiKey) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Gemini API key is not configured.'
        );
    }

    const performanceSummary = performances
        .map((p) => `${p.topicName} (${p.language}): ${p.accuracy.toFixed(0)}% accuracy - ${p.competency}`)
        .join('\n');

    const prompt = `You are an expert programming tutor. Based on the following student performance data, provide personalized learning recommendations.

Student Performance Summary:
${performanceSummary}

Respond in the following JSON format ONLY (no markdown, no code blocks, just raw JSON):
{
  "summary": "A 2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "studyPlan": "A paragraph describing a recommended study plan"
}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate recommendations.');
    }
});
