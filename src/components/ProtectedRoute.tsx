import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-950">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
