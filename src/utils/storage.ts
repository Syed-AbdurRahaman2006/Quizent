/**
 * storage.ts — LocalStorage & SessionStorage utility for Quizent.
 * All quiz attempt persistence goes through these functions.
 */

import { Answer } from '../types';

// ─── Keys ──────────────────────────────────────────────────────────────────────
const KEYS = {
    QUIZ_PROGRESS: 'quizent_quiz_progress',
} as const;

export interface QuizProgressState {
    quizId: string;
    quizTitle: string;
    language: string;
    topicName: string;
    questionNumber: number;
    answers: Answer[];
    timeElapsed: number;
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
