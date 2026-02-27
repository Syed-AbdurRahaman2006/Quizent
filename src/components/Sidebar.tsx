import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard,
    BookOpen,
    Shield,
    Users,
    BarChart3,
    LogOut,
    Zap,
    X,
} from 'lucide-react';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const { user, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
        }`;

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-extrabold text-white tracking-tight">Quizent</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 rounded-lg hover:bg-white/[0.06] text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1">
                        {!isAdmin && (
                            <>
                                <p className="px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                                    Main
                                </p>
                                <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
                                    <LayoutDashboard className="w-4.5 h-4.5" />
                                    Dashboard
                                </NavLink>
                                <NavLink to="/quizzes" className={linkClass} onClick={onClose}>
                                    <BookOpen className="w-4.5 h-4.5" />
                                    Browse Quizzes
                                </NavLink>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <p className="px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                                    Admin
                                </p>
                                <NavLink to="/admin" end className={linkClass} onClick={onClose}>
                                    <Shield className="w-4.5 h-4.5" />
                                    Admin Dashboard
                                </NavLink>
                                <NavLink to="/admin/quizzes" className={linkClass} onClick={onClose}>
                                    <BookOpen className="w-4.5 h-4.5" />
                                    Quiz Management
                                </NavLink>
                                <NavLink to="/admin/analytics" className={linkClass} onClick={onClose}>
                                    <BarChart3 className="w-4.5 h-4.5" />
                                    User Analytics
                                </NavLink>
                            </>
                        )}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-white/[0.06]">
                        <div className="flex items-center gap-3 mb-3 px-2">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full ring-2 ring-indigo-500/40"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
