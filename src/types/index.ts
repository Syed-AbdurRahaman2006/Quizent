export type UserRole = 'admin' | 'user';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Competency = 'strong' | 'medium' | 'weak';

export interface AppUser {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
    role: UserRole;
    createdAt: Date;
}

export interface Topic {
    id: string;
    name: string;
    language: string;
}

export interface Quiz {
    id: string;
    title: string;
    topicId: string;
    language: string;
    createdBy: string;
    createdAt: Date;
    questionCount?: number;
}

export interface Question {
    id: string;
    quizId: string;
    difficulty: Difficulty;
    questionText: string;
    options: string[];
    correctAnswer: number; // index of correct option
}

export interface Attempt {
    id: string;
    userId: string;
    quizId: string;
    quizTitle?: string;
    language?: string;
    topicName?: string;
    startedAt: Date;
    completedAt?: Date;
    score: number;
    totalQuestions: number;
    accuracy: number;
}

export interface Answer {
    id: string;
    attemptId: string;
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    difficulty: Difficulty;
    timestamp: Date;
}

export interface QuizResult {
    attempt: Attempt;
    answers: Answer[];
    difficultyBreakdown: {
        easy: { correct: number; total: number };
        medium: { correct: number; total: number };
        hard: { correct: number; total: number };
    };
    topicCompetency: Competency;
    score: number;
    accuracy: number;
}

export interface TopicPerformance {
    topicId: string;
    topicName: string;
    language: string;
    accuracy: number;
    competency: Competency;
    attemptsCount: number;
}

export interface AIRecommendation {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    studyPlan: string;
}
