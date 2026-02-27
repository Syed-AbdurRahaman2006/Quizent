import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import InputField from '../components/InputField';

interface MockUser {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
}

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 4) {
            newErrors.password = 'Password must be at least 4 characters';
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Check for duplicate email
        const existing: MockUser[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        if (existing.some((u) => u.email === email)) {
            newErrors.email = 'An account with this email already exists';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const existing: MockUser[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const newUser: MockUser = { name, email, password, role };
        existing.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(existing));

        setSuccess(true);
        setTimeout(() => navigate('/auth'), 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-400/[0.08] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-400/[0.07] rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Quizent</h1>
                </div>

                {/* Card */}
                <div className="glass-card p-8" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}>
                    <h2 className="text-xl font-extrabold text-slate-900 text-center mb-1">Create Account</h2>
                    <p className="text-sm text-slate-500 text-center mb-6">Join Quizent and start learning</p>

                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Account Created!</h3>
                            <p className="text-sm text-slate-500 mt-1">Redirecting to sign in...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField
                                id="signup-name"
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                                error={errors.name}
                            />

                            <InputField
                                id="signup-email"
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                                error={errors.email}
                            />

                            <InputField
                                id="signup-password"
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                                error={errors.password}
                            />

                            <InputField
                                id="signup-confirm"
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                                error={errors.confirmPassword}
                            />

                            {/* Role Selector */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-4 py-3 text-slate-900 text-sm transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 appearance-none cursor-pointer"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-primary-500/25 hover:shadow-primary-500/40"
                            >
                                Create Account
                            </button>
                        </form>
                    )}

                    {/* Back to login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
