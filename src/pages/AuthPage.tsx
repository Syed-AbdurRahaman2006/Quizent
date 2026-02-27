import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import AuthTabs from '../components/AuthTabs';
import InputField from '../components/InputField';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>({});
    const navigate = useNavigate();
    const { enterDemoMode } = useAuth();

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

        if (!termsAccepted) {
            newErrors.terms = 'You must accept the terms & conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        // Check localStorage for registered users
        interface MockUser { name: string; email: string; password: string; role: 'user' | 'admin'; }
        const mockUsers: MockUser[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const found = mockUsers.find((u) => u.email === email);

        // Determine role: use stored user's role if found, otherwise use selected tab
        const loginRole = found ? found.role : activeTab;
        const loginName = found ? found.name : undefined;

        enterDemoMode(loginRole, email);

        if (loginRole === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-400/[0.12] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-400/[0.10] rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Quizent</h1>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-extrabold text-slate-900 text-center mb-1">Welcome to Quizent</h2>
                    <p className="text-sm text-slate-500 text-center mb-6">Sign in to your account to continue</p>

                    {/* Tabs */}
                    <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <InputField
                            id="email"
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                            error={errors.email}
                            autoComplete="email"
                        />

                        <InputField
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                            error={errors.password}
                            autoComplete="current-password"
                        />

                        {/* Terms */}
                        <div>
                            <label className="flex items-start gap-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => { setTermsAccepted(e.target.checked); setErrors((prev) => ({ ...prev, terms: undefined })); }}
                                    className="mt-0.5 w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                                />
                                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                                    I agree to the <span className="text-indigo-600 font-semibold hover:underline">Terms &amp; Conditions</span>
                                </span>
                            </label>
                            {errors.terms && (
                                <p className="mt-1.5 text-xs text-red-500 font-medium ml-6">{errors.terms}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`w-full font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${activeTab === 'user'
                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-primary-500/25 hover:shadow-primary-500/40'
                                : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-violet-500/25 hover:shadow-violet-500/40'
                                }`}
                        >
                            Sign In as {activeTab === 'user' ? 'User' : 'Admin'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-slate-500">
                        First time user?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
