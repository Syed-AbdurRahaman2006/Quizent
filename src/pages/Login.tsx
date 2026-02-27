import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Brain, BarChart3, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useEffect, useState, FormEvent } from 'react';
import InputField from '../components/InputField';

export default function Login() {
    const { user, signIn, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);

    const handleCaptcha = (value: string | null) => {
        if (value) {
            setCaptchaVerified(true);
        }
    };

    // Removed useEffect redirect to prevent race conditions during auth resolution

    const handleSignIn = async (e: FormEvent) => {
        e.preventDefault();

        if (!captchaVerified) {
            setError("Please verify the CAPTCHA before signing in.");
            return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
            const appUser = await signIn(email, password);
            if (appUser.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Sign in failed:', err);
            let errorMessage = 'Invalid email or password.';
            if (err?.code === 'auth/user-not-found') errorMessage = 'User not found.';
            else if (err?.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
            else if (err?.code === 'permission-denied') errorMessage = 'Permission denied retrieving user role.';
            else if (err?.message) errorMessage = err.message;

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 flex">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-surface-950 to-violet-600/20" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center px-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold gradient-text">AdaptIQ</h1>
                    </div>

                    <p className="text-xl text-surface-200/70 mb-12 leading-relaxed max-w-md">
                        Adaptive quizzes that evolve with you. Master programming concepts through
                        AI-powered personalized assessments.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: Brain, title: 'Adaptive Difficulty', desc: 'Questions adjust to your level in real-time' },
                            { icon: BarChart3, title: 'Deep Analytics', desc: 'Track your progress across all topics' },
                            { icon: Sparkles, title: 'AI Recommendations', desc: 'Personalized learning paths powered by Gemini' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                                    <Icon className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{title}</h3>
                                    <p className="text-sm text-surface-200/50">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - sign in */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text">AdaptIQ</h1>
                    </div>

                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">Welcome back</h2>
                        <p className="text-slate-500 mb-8">Sign in to continue your learning journey</p>

                        {error && (
                            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignIn} className="space-y-4">
                            <InputField
                                id="email"
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <div className="space-y-1.5 mb-4 mt-4">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 pr-12 w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center mt-6 mb-2">
                                <ReCAPTCHA
                                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                    onChange={handleCaptcha}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || isSubmitting}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors hover:underline">
                                Sign up instead
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

