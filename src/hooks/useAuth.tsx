import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AppUser } from '../types';

interface AuthContextType {
    user: AppUser | null;
    firebaseUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    isDemoMode: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    enterDemoMode: (role?: 'user' | 'admin', email?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    isAdmin: false,
    isDemoMode: false,
    signIn: async () => { },
    signOut: async () => { },
    enterDemoMode: () => { },
});

function isFirebaseConfigured(): boolean {
    return !!(
        import.meta.env.VITE_FIREBASE_API_KEY &&
        import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here'
    );
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        if (!isFirebaseConfigured()) {
            console.info('Firebase not configured. Running in demo mode available.');
            setLoading(false);
            return;
        }

        // Dynamically import to avoid crashes when Firebase isn't configured
        let unsubscribe: (() => void) | undefined;

        import('../services/auth').then(({ onAuthChange, getOrCreateUser }) => {
            unsubscribe = onAuthChange(async (fbUser) => {
                setFirebaseUser(fbUser);
                if (fbUser) {
                    try {
                        const appUser = await getOrCreateUser(fbUser);
                        setUser(appUser);
                    } catch (err: any) {
                        // If Firestore is offline, don't crash the auth state—use a fallback user session based on cached auth
                        if (err?.message?.includes('offline') || err?.code === 'unavailable') {
                            console.warn('Firestore is offline. Using cached auth user data.');
                            setUser({
                                id: fbUser.uid,
                                name: fbUser.displayName || 'User',
                                email: fbUser.email || '',
                                photoURL: fbUser.photoURL || undefined,
                                role: 'user',
                                createdAt: new Date(),
                            });
                        } else {
                            console.error('Error getting user data:', err);
                            setUser(null);
                        }
                    }
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
        }).catch((err) => {
            console.error('Firebase auth init error:', err);
            setLoading(false);
        });

        // Safety timeout
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            unsubscribe?.();
            clearTimeout(timeout);
        };
    }, []);

    const signIn = async () => {
        if (!isFirebaseConfigured()) {
            throw new Error('Firebase is not configured. Please add Firebase credentials to .env file.');
        }
        try {
            const { signInWithGoogle } = await import('../services/auth');
            const appUser = await signInWithGoogle();
            setUser(appUser);
        } catch (err) {
            console.error('Sign in error:', err);
            throw err;
        }
    };

    const signOut = async () => {
        if (isDemoMode) {
            setUser(null);
            setIsDemoMode(false);
            return;
        }
        try {
            const { signOut: authSignOut } = await import('../services/auth');
            await authSignOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
        setUser(null);
        setFirebaseUser(null);
    };

    const enterDemoMode = (role: 'user' | 'admin' = 'admin', email?: string) => {
        const demoUser: AppUser = {
            id: 'demo_user',
            name: role === 'admin' ? 'Admin User' : 'Demo User',
            email: email || 'demo@quizent.app',
            role,
            createdAt: new Date(),
        };
        setUser(demoUser);
        setIsDemoMode(true);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                loading,
                isAdmin: user?.role === 'admin',
                isDemoMode,
                signIn,
                signOut,
                enterDemoMode,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
