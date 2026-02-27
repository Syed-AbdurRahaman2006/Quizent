import { Difficulty, Question, Answer, Competency, QuizResult, Attempt } from '../types';

/**
 * Core adaptive quiz engine.
 * Adjusts difficulty based on user performance in real-time.
 */

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

export function getNextDifficulty(current: Difficulty, isCorrect: boolean): Difficulty {
    const idx = DIFFICULTY_ORDER.indexOf(current);
    if (isCorrect) {
        return DIFFICULTY_ORDER[Math.min(idx + 1, 2)];
    } else {
        return DIFFICULTY_ORDER[Math.max(idx - 1, 0)];
    }
}

export function selectNextQuestion(
    questions: Question[],
    targetDifficulty: Difficulty,
    answeredIds: Set<string>
): Question | null {
    // First try to find a question at the target difficulty
    const available = questions.filter(
        (q) => q.difficulty === targetDifficulty && !answeredIds.has(q.id)
    );
    if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
    }

    // Fallback: find closest difficulty
    const fallbackOrder: Difficulty[] =
        targetDifficulty === 'hard'
            ? ['medium', 'easy']
            : targetDifficulty === 'easy'
                ? ['medium', 'hard']
                : ['easy', 'hard'];

    for (const diff of fallbackOrder) {
        const fallback = questions.filter(
            (q) => q.difficulty === diff && !answeredIds.has(q.id)
        );
        if (fallback.length > 0) {
            return fallback[Math.floor(Math.random() * fallback.length)];
        }
    }

    return null; // No more questions available
}

export function calculateDifficultyBreakdown(answers: Answer[]) {
    const breakdown = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
    };

    answers.forEach((a) => {
        breakdown[a.difficulty].total++;
        if (a.isCorrect) breakdown[a.difficulty].correct++;
    });

    return breakdown;
}

export function determineCompetency(accuracy: number): Competency {
    if (accuracy >= 70) return 'strong';
    if (accuracy >= 40) return 'medium';
    return 'weak';
}

export function calculateResults(
    attempt: Attempt,
    answers: Answer[]
): QuizResult {
    const correct = answers.filter((a) => a.isCorrect).length;
    const total = answers.length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const difficultyBreakdown = calculateDifficultyBreakdown(answers);

    return {
        attempt: { ...attempt, score: correct, accuracy },
        answers,
        difficultyBreakdown,
        topicCompetency: determineCompetency(accuracy),
        score: correct,
        accuracy,
    };
}

export function getCompetencyColor(competency: Competency): string {
    switch (competency) {
        case 'strong': return 'text-emerald-400';
        case 'medium': return 'text-amber-400';
        case 'weak': return 'text-red-400';
    }
}

export function getDifficultyLabel(difficulty: Difficulty): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}
