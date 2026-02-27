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
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Topic } from '../types';

const COLLECTION = 'topics';

export async function getTopics(): Promise<Topic[]> {
    const q = query(collection(db, COLLECTION), orderBy('language'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
}

export async function getTopicsByLanguage(language: string): Promise<Topic[]> {
    const q = query(
        collection(db, COLLECTION),
        where('language', '==', language),
        orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
}

export async function getTopicById(id: string): Promise<Topic | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Topic;
}

export async function createTopic(data: Omit<Topic, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTION), data);
    return ref.id;
}

export async function updateTopic(id: string, data: Partial<Topic>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteTopic(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
}

export function getUniqueLanguages(topics: Topic[]): string[] {
    return [...new Set(topics.map((t) => t.language))].sort();
}
