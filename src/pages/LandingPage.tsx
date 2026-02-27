import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap,
    Brain,
    BarChart3,
    Sparkles,
    BookOpen,
    ArrowRight,
    ChevronRight,
    Menu,
    X,
    Github,
    Twitter,
    Linkedin,
    Target,
    TrendingUp,
    Lightbulb,
} from 'lucide-react';

const PREVIEW_TABS = [
    {
        id: 'dashboard',
        label: 'User Dashboard',
        image: '/previews/user-dashboard.png',
        title: 'User Dashboard',
        description: 'Track progress, view quiz history, and analyze topic mastery.',
    },
    {
        id: 'insights',
        label: 'Adaptive Quiz Interface',
        image: '/previews/ai-insights.png',
        title: 'Adaptive Quiz Interface',
        description: 'Experience intelligent quizzes that adjust difficulty dynamically.',
    },
    {
        id: 'admin',
        label: 'Admin Dashboard',
        image: '/previews/admin-dashboard.png',
        title: 'Admin Dashboard',
        description: 'Manage quizzes, questions, and monitor student performance.',
    },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activePreview, setActivePreview] = useState('dashboard');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const currentPreview = PREVIEW_TABS.find((t) => t.id === activePreview)!;

    return (
        <div
            className="min-h-screen text-slate-900 relative selection:bg-indigo-500/20"
            style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 40%, #e0e7ff 100%)'
            }}
        >

            {/* ═══════════════════ NAVBAR ═══════════════════ */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-white/70 backdrop-blur-xl border-b border-indigo-900/[0.04] shadow-sm'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[72px] flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
                            <Zap className="w-[18px] h-[18px] text-white" />
                        </div>
                        <span className="text-[19px] font-bold tracking-tight text-slate-900">
                            Quizent
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {['Features', 'Product', 'How It Works'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 rounded-lg hover:bg-indigo-500/[0.04]"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="w-px h-5 bg-slate-900/[0.06] mx-2" />
                        <Link to="/auth" className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 rounded-lg hover:bg-indigo-500/[0.04]">
                            Login
                        </Link>
                        <Link
                            to="/auth"
                            className="ml-2 px-5 py-2 text-[13px] font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/20"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-900/[0.04]"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-900/[0.04] px-6 py-5 space-y-1 shadow-xl">
                        {['Features', 'Product', 'How It Works'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-500/[0.04]"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="h-px bg-slate-900/[0.06] my-2" />
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600">Login</Link>
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block mt-2 text-center px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white">Get Started</Link>
                    </div>
                )}
            </nav>

            {/* ═══════════════════ HERO ═══════════════════ */}
            <section className="relative pt-36 pb-24 md:pt-44 md:pb-36 px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">

                {/* Abstract Design Elements (Inspiration from image) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full pointer-events-none hidden lg:block">
                    {/* Pink/Blue Abstract Shapes */}
                    <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-gradient-to-br from-pink-200 to-rose-300 rounded-full blur-3xl opacity-40 mix-blend-multiply" />
                    <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] bg-gradient-to-tr from-blue-300 to-indigo-300 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
                    <div className="absolute top-[60%] right-[15%] w-[250px] h-[250px] bg-gradient-to-br from-violet-200 to-purple-300 rounded-[60px] blur-3xl opacity-60 mix-blend-multiply rotate-45" />

                    {/* 3D-like floaters (CSS implementation) */}
                    <div className="absolute top-[30%] right-[20%] w-32 h-32 rounded-3xl bg-gradient-to-br from-white to-blue-50 shadow-[0_20px_50px_rgba(30,58,138,0.15)] rotate-12 backdrop-blur-xl border border-white/50 animate-[float_6s_ease-in-out_infinite]" />
                    <div className="absolute top-[55%] right-[35%] w-24 h-24 rounded-full bg-gradient-to-tr from-pink-100 to-rose-100 shadow-[0_15px_40px_rgba(225,29,72,0.15)] -rotate-12 backdrop-blur-xl border border-white/60 animate-[float_8s_ease-in-out_infinite_reverse]" />
                </div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left text content */}
                    <div className="text-center lg:text-left">
                        {/* Pill badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-[12px] font-semibold text-indigo-700 mb-8 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Smarter Learning Path
                        </div>

                        <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-slate-900 drop-shadow-sm">
                            AI-Powered
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                                Adaptive Quiz
                            </span>
                            <br />
                            Platform
                        </h1>

                        <p className="mt-6 text-[17px] md:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Quizent intelligently adjusts quiz difficulty based on your performance so you can learn faster and identify weak areas.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                to="/auth"
                                className="group flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-[15px] hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-indigo-500/25 w-full sm:w-auto"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#product"
                                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-slate-700 font-semibold text-[15px] hover:bg-white hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                            >
                                See it in Action
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ FEATURES ═══════════════════ */}
            <section id="features" className="py-24 md:py-32 px-6 lg:px-8 bg-white/50 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent pointer-events-none" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <p className="text-[13px] font-bold text-indigo-600 tracking-widest uppercase mb-4">Features</p>
                        <h2 className="text-3xl md:text-[2.75rem] font-extrabold leading-tight text-slate-900">Why Quizent?</h2>
                        <p className="mt-5 text-slate-600 text-[16px] leading-relaxed">
                            Everything you need to master programming through intelligent, adaptive assessments.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Brain,
                                title: 'Adaptive Quiz Engine',
                                desc: 'Automatically adjusts question difficulty based on your answers in real time.',
                                iconBg: 'bg-indigo-100',
                                iconColor: 'text-indigo-600',
                            },
                            {
                                icon: Sparkles,
                                title: 'AI Learning Insights',
                                desc: 'Understand strengths and weaknesses through personalized AI analysis.',
                                iconBg: 'bg-purple-100',
                                iconColor: 'text-purple-600',
                            },
                            {
                                icon: BookOpen,
                                title: 'Topic Based Practice',
                                desc: 'Practice programming concepts organized by language and topics.',
                                iconBg: 'bg-emerald-100',
                                iconColor: 'text-emerald-600',
                            },
                            {
                                icon: BarChart3,
                                title: 'Performance Analytics',
                                desc: 'Visualize learning progress with clean, detailed performance charts.',
                                iconBg: 'bg-rose-100',
                                iconColor: 'text-rose-600',
                            },
                        ].map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
                            <div
                                key={title}
                                className="group relative p-8 rounded-3xl border border-indigo-100/50 bg-white hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/5"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-6`}>
                                    <Icon className={`w-6 h-6 ${iconColor}`} />
                                </div>
                                <h3 className="text-[17px] font-bold mb-3 text-slate-900">{title}</h3>
                                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ PRODUCT PREVIEW ═══════════════════ */}
            <section id="product" className="py-24 md:py-32 px-6 lg:px-8 relative">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="max-w-2xl mx-auto text-center mb-14">
                        <p className="text-[13px] font-bold text-indigo-600 tracking-widest uppercase mb-4">Product</p>
                        <h2 className="text-3xl md:text-[2.75rem] font-extrabold leading-tight text-slate-900">See Quizent in Action</h2>
                        <p className="mt-5 text-slate-600 text-[16px] leading-relaxed">
                            Powerful tools designed for learners and administrators.
                        </p>
                    </div>

                    {/* Tab buttons */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex rounded-2xl border border-indigo-100 p-1.5 bg-white shadow-sm flex-wrap justify-center gap-1">
                            {PREVIEW_TABS.map((tab) => {
                                const isActive = activePreview === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActivePreview(tab.id)}
                                        className={`px-6 py-3 rounded-xl text-[14px] font-bold transition-all duration-200 ${isActive
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Preview display */}
                    <div className="relative max-w-5xl mx-auto">
                        {/* Glow behind image */}
                        <div className="absolute -inset-6 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-[2.5rem] blur-3xl opacity-40 pointer-events-none" />

                        <div className="relative rounded-[2rem] overflow-hidden border border-indigo-100 bg-white shadow-2xl shadow-indigo-900/10">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-indigo-50 bg-slate-50/80">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                </div>
                            </div>

                            {/* Screenshot */}
                            <div className="relative bg-slate-100">
                                <img
                                    key={currentPreview.id}
                                    src={currentPreview.image}
                                    alt={currentPreview.title}
                                    className="w-full h-auto block object-cover object-top origin-top animate-[reveal_0.5s_ease-out]"
                                    style={{ maxHeight: '600px' }}
                                />
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="mt-8 text-center max-w-2xl mx-auto">
                            <h3 className="text-xl font-bold text-slate-900">{currentPreview.title}</h3>
                            <p className="mt-3 text-[15.5px] text-slate-600 leading-relaxed font-medium">{currentPreview.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
            <section id="how-it-works" className="py-24 md:py-32 px-6 lg:px-8 bg-white/40">
                <div className="max-w-5xl mx-auto">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <p className="text-[13px] font-bold text-indigo-600 tracking-widest uppercase mb-4">Process</p>
                        <h2 className="text-3xl md:text-[2.75rem] font-extrabold leading-tight text-slate-900">How It Works</h2>
                        <p className="mt-5 text-slate-600 text-[16px] leading-relaxed">
                            Three simple steps to start your adaptive learning journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { num: '01', icon: Target, title: 'Choose a topic', desc: 'Select a programming language and topic — Java, Python, JavaScript, and more.' },
                            { num: '02', icon: TrendingUp, title: 'Take adaptive quiz', desc: 'Answer questions that dynamically adjust difficulty based on your performance.' },
                            { num: '03', icon: Lightbulb, title: 'Analyze results', desc: 'Receive personalized analysis of strengths, weaknesses, and what to study next.' },
                        ].map(({ num, icon: Icon, title, desc }) => (
                            <div
                                key={num}
                                className="group relative p-10 rounded-[2rem] border border-indigo-100/50 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 text-center flex flex-col items-center"
                            >
                                <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[80px] font-black text-slate-50 opacity-50 select-none pointer-events-none">{num}</span>
                                <div className="relative w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mt-6 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Icon className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h3 className="relative text-[19px] font-bold mb-3 text-slate-900">{title}</h3>
                                <p className="relative text-[14.5px] text-slate-600 leading-relaxed font-medium">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ CTA ═══════════════════ */}
            <section className="py-24 md:py-36 px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-100/50 pointer-events-none" />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-[3rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 mb-10 drop-shadow-sm">
                        Start mastering programming concepts with Quizent
                    </h2>
                    <Link
                        to="/auth"
                        className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-slate-900 text-white font-bold text-[16px] hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-indigo-500/25 hover:-translate-y-1 w-full sm:w-auto"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════ FOOTER ═══════════════════ */}
            <footer className="border-t border-indigo-100 pt-16 pb-8 px-6 lg:px-8 bg-white/60">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-14">
                        {/* Brand — spans 2 cols */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-slate-900 tracking-tight">Quizent</span>
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[240px] font-medium">
                                Quizent is an AI-powered adaptive quiz platform designed to help learners understand their strengths and weaknesses through intelligent assessments.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-[12px] font-bold mb-4 text-indigo-900/40 tracking-widest uppercase">Product</h4>
                            <ul className="space-y-3">
                                {['Features', 'Adaptive Quizzes', 'Analytics', 'AI Insights'].map((l) => (
                                    <li key={l}><a href="#features" className="text-[13px] font-medium text-slate-500 hover:text-indigo-600 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-[12px] font-bold mb-4 text-indigo-900/40 tracking-widest uppercase">Resources</h4>
                            <ul className="space-y-3">
                                {['Documentation', 'Blog', 'Learning Guide'].map((l) => (
                                    <li key={l}><a href="#" className="text-[13px] font-medium text-slate-500 hover:text-indigo-600 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-[12px] font-bold mb-4 text-indigo-900/40 tracking-widest uppercase">Company</h4>
                            <ul className="space-y-3">
                                {['About', 'Contact', 'Careers'].map((l) => (
                                    <li key={l}><a href="#" className="text-[13px] font-medium text-slate-500 hover:text-indigo-600 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-[12px] font-bold mb-4 text-indigo-900/40 tracking-widest uppercase">Support</h4>
                            <ul className="space-y-3">
                                {['Help Center', 'Report Issue'].map((l) => (
                                    <li key={l}><a href="#" className="text-[13px] font-medium text-slate-500 hover:text-indigo-600 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Divider + bottom */}
                    <div className="border-t border-indigo-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-[12px] font-medium text-slate-400">
                            <span>© 2026 Quizent</span>
                            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
                            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
                        </div>
                        <div className="flex items-center gap-2">
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
