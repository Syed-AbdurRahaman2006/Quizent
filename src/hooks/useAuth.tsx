import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AppUser } from '../types';

interface AuthContextType {
    user: AppUser | null;
    firebaseUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    isDemoMode: boolean;
    signIn: (email: string, password: string) => Promise<AppUser>;
    signUp: (email: string, password: string, name: string, role: 'user' | 'admin') => Promise<AppUser>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    isAdmin: false,
    isDemoMode: false,
    signIn: async () => ({} as AppUser),
    signUp: async () => ({} as AppUser),
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {

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
                        console.error('Error getting user data in auth state change:', err);
                        // Unlike the silent fallback we previously had, if we can't get the role,
                        // we shouldn't grant authenticated status silently.
                        setUser(null);
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

    const signIn = async (email: string, password: string): Promise<AppUser> => {
        try {
            const { signInWithEmail } = await import('../services/auth');
            const appUser = await signInWithEmail(email, password);
            setUser(appUser);
            return appUser;
        } catch (err) {
            console.error('Sign in error:', err);
            throw err;
        }
    };

    const signUp = async (email: string, password: string, name: string, role: 'user' | 'admin'): Promise<AppUser> => {
        try {
            const { signUpWithEmail } = await import('../services/auth');
            const appUser = await signUpWithEmail(email, password, name, role);
            setUser(appUser);
            return appUser;
        } catch (err) {
            console.error('Sign up error:', err);
            throw err;
        }
    };

    const signOut = async () => {
        try {
            const { signOut: authSignOut } = await import('../services/auth');
            await authSignOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
        setUser(null);
        setFirebaseUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                loading,
                isAdmin: user?.role === 'admin',
                isDemoMode: false,
                signIn,
                signUp,
                signOut,
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
