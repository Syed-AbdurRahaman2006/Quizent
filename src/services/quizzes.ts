import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Quiz, Question } from '../types';

// --- Quizzes ---

export async function getQuizzes(): Promise<Quiz[]> {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
        } as Quiz;
    });
}

export async function getQuizzesByLanguage(language: string): Promise<Quiz[]> {
    const q = query(
        collection(db, 'quizzes'),
        where('language', '==', language),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate() || new Date() } as Quiz;
    });
}

export async function getQuizzesByTopic(topicId: string): Promise<Quiz[]> {
    const q = query(
        collection(db, 'quizzes'),
        where('topicId', '==', topicId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate() || new Date() } as Quiz;
    });
}

export async function getQuizById(id: string): Promise<Quiz | null> {
    const snap = await getDoc(doc(db, 'quizzes', id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return { id: snap.id, ...data, createdAt: data.createdAt?.toDate() || new Date() } as Quiz;
}

export async function createQuiz(data: Omit<Quiz, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'quizzes'), {
        ...data,
        createdAt: new Date(),
    });
    return ref.id;
}

export async function updateQuiz(id: string, data: Partial<Quiz>): Promise<void> {
    await updateDoc(doc(db, 'quizzes', id), data);
}

export async function deleteQuiz(id: string): Promise<void> {
    // Delete all questions in this quiz first
    const questions = await getQuestionsByQuiz(id);
    for (const q of questions) {
        await deleteDoc(doc(db, 'questions', q.id));
    }
    await deleteDoc(doc(db, 'quizzes', id));
}

// --- Questions ---

export async function getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    const q = query(
        collection(db, 'questions'),
        where('quizId', '==', quizId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
}

export async function createQuestion(data: Omit<Question, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'questions'), data);
    return ref.id;
}

export async function updateQuestion(id: string, data: Partial<Question>): Promise<void> {
    await updateDoc(doc(db, 'questions', id), data);
}

export async function deleteQuestion(id: string): Promise<void> {
    await deleteDoc(doc(db, 'questions', id));
}
