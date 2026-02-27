import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import AuthTabs from '../components/AuthTabs';
import InputField from '../components/InputField';
import { useAuth } from '../hooks/useAuth';
import TermsModal from '../components/TermsModal';
import MockCaptcha from '../components/MockCaptcha';

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useAuth();

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!captchaVerified) {
            alert("Please verify the CAPTCHA before signing in.");
            return;
        }

        if (!validate()) return;

        try {
            // Note: Since the prompt requested clean Email/Password flows instead of Demo Mode,
            // we will invoke the real signIn function here instead of checking mocks.
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Sign in failed:', err);
            setErrors({ email: err.message || 'Invalid email or password.' });
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

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                                    autoComplete="current-password"
                                    className={`w-full bg-slate-50 border rounded-[10px] pl-4 pr-12 py-3 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.password
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15 hover:border-slate-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-[13.5px] text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>
                            )}
                        </div>

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
                                    I agree to the <button type="button" onClick={() => setIsTermsOpen(true)} className="text-indigo-600 font-semibold hover:underline">Terms &amp; Conditions</button>
                                </span>
                            </label>
                            {errors.terms && (
                                <p className="mt-1.5 text-xs text-red-500 font-medium ml-6">{errors.terms}</p>
                            )}
                        </div>
                        {/* CAPTCHA */}
                        <div className="flex justify-center mt-6 mb-4">
                            <MockCaptcha
                                onVerify={setCaptchaVerified}
                            />
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

            <TermsModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
            />
        </div>
    );
}
