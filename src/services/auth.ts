import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AppUser } from '../types';

export async function signUpWithEmail(email: string, password: string, name: string, role: 'user' | 'admin'): Promise<AppUser> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newUser: Omit<AppUser, 'id'> = {
            name: name || "",
            email: user.email || email,
            role: role || 'user',
            createdAt: new Date(),
        };

        const docData = {
            uid: user.uid,
            name: name || "",
            email: user.email || email,
            role: role || 'user',
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp()
        };

        // Strict explicit setDoc after auth succeeds
        await setDoc(doc(db, 'users', user.uid), docData);

        // Clear local storage and store minimal currentUser
        localStorage.removeItem('userData');
        localStorage.removeItem('quizent_attempts');
        localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, role: docData.role }));

        return { id: user.uid, ...newUser, photoURL: user.photoURL || undefined };
    } catch (err) {
        throw err; // Rely on UI layers to catch and map specific auth errors
    }
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
    try {
        // DO NOT fetch Firestore before authentication.
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Fetch document only after successful auth
        const userDoc = await getDoc(doc(db, "users", uid));

        if (!userDoc.exists()) {
            throw new Error("User role not found");
        }

        const data = userDoc.data();

        // Ensure state resets on login
        localStorage.removeItem('userData');
        localStorage.removeItem('quizent_attempts');
        localStorage.setItem('currentUser', JSON.stringify({ uid, role: data.role }));

        return {
            id: uid,
            name: data.fullName || data.name || 'User',
            email: data.email || email,
            photoURL: data.photoURL,
            role: data.role as 'user' | 'admin',
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    } catch (err) {
        throw err;
    }
}

export async function signOut(): Promise<void> {
    localStorage.removeItem('userData');
    localStorage.removeItem('quizent_attempts');
    localStorage.removeItem('currentUser');
    await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export async function getOrCreateUser(user: User): Promise<AppUser> {
    const userRef = doc(db, 'users', user.uid);
    try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                id: user.uid,
                name: data.fullName || data.name || 'User',
                email: data.email,
                photoURL: data.photoURL,
                role: data.role,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        }

        throw new Error("User role not found in Firestore.");
    } catch (err) {
        console.error("Failed to read user doc attached to Firebase auth instance.", err);
        throw err;
    }
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
