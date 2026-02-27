import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { AppUser } from '../types';

export async function signInWithGoogle(): Promise<AppUser> {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDoc = await getOrCreateUser(user);
    return userDoc;
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export async function getOrCreateUser(user: User): Promise<AppUser> {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return {
            id: user.uid,
            name: data.name,
            email: data.email,
            photoURL: data.photoURL,
            role: data.role,
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    }

    const newUser: Omit<AppUser, 'id'> = {
        name: user.displayName || 'User',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        role: 'user',
        createdAt: new Date(),
    };

    await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
    });

    return { id: user.uid, ...newUser };
}

export async function getUserById(uid: string): Promise<AppUser | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    const data = userSnap.data();
    return {
        id: uid,
        name: data.name,
        email: data.email,
        photoURL: data.photoURL,
        role: data.role,
        createdAt: data.createdAt?.toDate() || new Date(),
    };
}
