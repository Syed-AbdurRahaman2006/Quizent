/**
 * storage.ts — LocalStorage & SessionStorage utility for Quizent.
 * All quiz attempt persistence goes through these functions.
 */

import { Attempt, Answer, TopicPerformance } from '../types';
import { determineCompetency } from './adaptiveEngine';

// ─── Keys ──────────────────────────────────────────────────────────────────────
const KEYS = {
    ATTEMPTS: 'quizent_attempts',
    QUIZ_PROGRESS: 'quizent_quiz_progress',
} as const;

// ─── Stored attempt shape (serialisable to JSON) ────────────────────────────────
export interface StoredAttempt {
    id: string;
    userId: string;
    quizId: string;
    quizTitle: string;
    language: string;
    topicName: string;
    score: number;
    totalQuestions: number;
    accuracy: number;
    date: string;            // ISO string
    answers: StoredAnswer[];
    difficultyBreakdown: {
        easy: { correct: number; total: number };
        medium: { correct: number; total: number };
        hard: { correct: number; total: number };
    };
}

export interface StoredAnswer {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    difficulty: string;
}

export interface QuizProgressState {
    quizId: string;
    quizTitle: string;
    language: string;
    topicName: string;
    questionNumber: number;
    answers: Answer[];
    timeElapsed: number;
}

// ─── Attempts ──────────────────────────────────────────────────────────────────

/** Returns all stored quiz attempts, newest first. */
export function getAttempts(): StoredAttempt[] {
    try {
        const raw = localStorage.getItem(KEYS.ATTEMPTS);
        return raw ? (JSON.parse(raw) as StoredAttempt[]) : [];
    } catch {
        return [];
    }
}

/** Saves a completed quiz attempt to localStorage. */
export function saveAttempt(attempt: StoredAttempt): void {
    try {
        const existing = getAttempts();
        existing.unshift(attempt);           // newest first
        localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(existing));
    } catch (err) {
        console.error('Failed to save attempt:', err);
    }
}

/** Converts raw quiz data into a StoredAttempt and saves it. */
export function saveQuizResult(params: {
    quizId: string;
    quizTitle: string;
    language: string;
    topicName: string;
    userId: string;
    answers: Answer[];
    totalQuestions: number;
    timeElapsed: number;
}): StoredAttempt {
    const { quizId, quizTitle, language, topicName, userId, answers, totalQuestions } = params;

    const score = answers.filter((a) => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    const breakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    answers.forEach((a) => {
        const d = a.difficulty as 'easy' | 'medium' | 'hard';
        breakdown[d].total += 1;
        if (a.isCorrect) breakdown[d].correct += 1;
    });

    const attempt: StoredAttempt = {
        id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId,
        quizId,
        quizTitle,
        language,
        topicName,
        score,
        totalQuestions,
        accuracy,
        date: new Date().toISOString(),
        difficultyBreakdown: breakdown,
        answers: answers.map((a) => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption,
            isCorrect: a.isCorrect,
            difficulty: a.difficulty,
        })),
    };

    saveAttempt(attempt);
    return attempt;
}

// ─── Analytics Helpers ─────────────────────────────────────────────────────────

/** Derives TopicPerformance[] from all stored attempts. */
export function getTopicPerformances(attempts: StoredAttempt[]): TopicPerformance[] {
    const map: Record<string, { topicName: string; language: string; totalAccuracy: number; count: number }> = {};

    attempts.forEach((a) => {
        const key = `${a.topicName}__${a.language}`;
        if (!map[key]) {
            map[key] = { topicName: a.topicName, language: a.language, totalAccuracy: 0, count: 0 };
        }
        map[key].totalAccuracy += a.accuracy;
        map[key].count += 1;
    });

    return Object.entries(map).map(([key, v], i) => {
        const avgAccuracy = v.totalAccuracy / v.count;
        return {
            topicId: `topic_${key}`,
            topicName: v.topicName,
            language: v.language,
            accuracy: Math.round(avgAccuracy),
            competency: determineCompetency(avgAccuracy),
            attemptsCount: v.count,
        };
    });
}

/** Computes per-difficulty totals across all stored attempts. */
export function getDifficultyBreakdown(attempts: StoredAttempt[]) {
    const totals = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    attempts.forEach((a) => {
        (['easy', 'medium', 'hard'] as const).forEach((d) => {
            totals[d].correct += a.difficultyBreakdown[d].correct;
            totals[d].total += a.difficultyBreakdown[d].total;
        });
    });
    return totals;
}

/** Converts StoredAttempt to the runtime Attempt type for Dashboard compatibility. */
export function toAttempt(sa: StoredAttempt): Attempt {
    return {
        id: sa.id,
        userId: sa.userId,
        quizId: sa.quizId,
        quizTitle: sa.quizTitle,
        language: sa.language,
        topicName: sa.topicName,
        score: sa.score,
        totalQuestions: sa.totalQuestions,
        accuracy: sa.accuracy,
        startedAt: new Date(sa.date),
        completedAt: new Date(sa.date),
    };
}

// ─── Session Progress (resume on refresh) ─────────────────────────────────────

/** Saves in-progress quiz state to sessionStorage. */
export function saveQuizProgress(progress: QuizProgressState): void {
    try {
        sessionStorage.setItem(KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
    } catch { /* ignore */ }
}

/** Loads in-progress quiz state from sessionStorage. Returns null if none. */
export function getQuizProgress(quizId: string): QuizProgressState | null {
    try {
        const raw = sessionStorage.getItem(KEYS.QUIZ_PROGRESS);
        if (!raw) return null;
        const p = JSON.parse(raw) as QuizProgressState;
        return p.quizId === quizId ? p : null;
    } catch {
        return null;
    }
}

/** Clears in-progress quiz state (call when quiz finishes or user navigates away). */
export function clearQuizProgress(): void {
    sessionStorage.removeItem(KEYS.QUIZ_PROGRESS);
}
