import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Attempt, Answer } from '../types';

export async function createAttempt(
    data: Omit<Attempt, 'id' | 'completedAt' | 'score' | 'accuracy'>
): Promise<string> {
    const ref = await addDoc(collection(db, 'attempts'), {
        ...data,
        score: 0,
        accuracy: 0,
        completedAt: null,
    });
    return ref.id;
}

export async function completeAttempt(
    attemptId: string,
    score: number,
    totalQuestions: number,
    accuracy: number
): Promise<void> {
    await updateDoc(doc(db, 'attempts', attemptId), {
        score,
        totalQuestions,
        accuracy,
        completedAt: new Date(),
    });
}

export async function saveAnswer(data: Omit<Answer, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'answers'), {
        ...data,
        timestamp: new Date(),
    });
    return ref.id;
}

export async function getUserAttempts(userId: string): Promise<Attempt[]> {
    const q = query(
        collection(db, 'attempts'),
        where('userId', '==', userId),
        orderBy('startedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            startedAt: data.startedAt?.toDate?.() || new Date(data.startedAt),
            completedAt: data.completedAt?.toDate?.() || (data.completedAt ? new Date(data.completedAt) : undefined),
        } as Attempt;
    });
}

export async function getAllAttempts(): Promise<Attempt[]> {
    const q = query(
        collection(db, 'attempts'),
        orderBy('startedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            startedAt: data.startedAt?.toDate?.() || new Date(data.startedAt),
            completedAt: data.completedAt?.toDate?.() || (data.completedAt ? new Date(data.completedAt) : undefined),
        } as Attempt;
    });
}

export async function getAttemptAnswers(attemptId: string): Promise<Answer[]> {
    const q = query(
        collection(db, 'answers'),
        where('attemptId', '==', attemptId),
        orderBy('timestamp')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        } as Answer;
    });
}
