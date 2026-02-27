export function generateInsights(attempt: { accuracy: number, topic: string }) {
    const accuracy = attempt.accuracy;
    const topic = attempt.topic || 'Programming';

    let strength = "";
    let weakness = "";
    let recommendation = "";

    if (accuracy >= 80) {
        strength = `You demonstrate strong understanding of ${topic}.`;
        weakness = `Minor mistakes may occur in advanced questions.`;
        recommendation = `You can now move to harder topics or attempt advanced quizzes.`;
    }
    else if (accuracy >= 50) {
        strength = `You have a basic understanding of ${topic}.`;
        weakness = `Some core concepts still need reinforcement.`;
        recommendation = `Review fundamental concepts and attempt another quiz on ${topic}.`;
    }
    else {
        strength = `You attempted ${topic}, which is a good start.`;
        weakness = `Your accuracy indicates gaps in core understanding.`;
        recommendation = `Start by reviewing beginner tutorials and practice simple problems before retaking the quiz.`;
    }

    // Optional Topic Rules
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('arrays')) {
        recommendation += " Practice Linked Lists next.";
    } else if (lowerTopic.includes('linked lists')) {
        recommendation += " Practice Stacks next.";
    } else if (lowerTopic.includes('stacks')) {
        recommendation += " Practice Queues next.";
    } else if (lowerTopic.includes('promises')) {
        recommendation += " Practice Async/Await next.";
    }

    return {
        strength,
        weakness,
        recommendation
    };
}
