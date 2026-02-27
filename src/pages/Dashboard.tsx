import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDemoQuizzes } from '../utils/seedData';
import { determineCompetency, getCompetencyColor } from '../utils/adaptiveEngine';
import { getAttempts, getTopicPerformances, toAttempt } from '../utils/storage';
import { Quiz, Attempt, TopicPerformance } from '../types';
import {
    Trophy,
    Target,
    TrendingUp,
    BookOpen,
    ChevronRight,
    Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, Filler);

/** Calculate streak: count consecutive days (from today backwards) with at least one attempt */
function calcStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    const unique = Array.from(new Set(dates.map((d) => d.slice(0, 10)))).sort().reverse();
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (const d of unique) {
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        const diff = Math.round((cursor.getTime() - day.getTime()) / 86400000);
        if (diff <= 1) { streak++; cursor = day; }
        else break;
    }
    return streak;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [performances, setPerformances] = useState<TopicPerformance[]>([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = getAttempts();
        const runtimeAttempts = stored.map(toAttempt);
        const perfs = getTopicPerformances(stored);
        const streakDays = calcStreak(stored.map((a) => a.date));

        setQuizzes(getDemoQuizzes());
        setAttempts(runtimeAttempts);
        setPerformances(perfs);
        setStreak(streakDays);
        setLoading(false);
    }, []);

    if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;

    const totalQuizzes = attempts.length;
    const avgAccuracy = attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length
        : 0;
    const strongTopics = performances.filter((p) => p.competency === 'strong');
    const weakTopics = performances.filter((p) => p.competency === 'weak');

    // Chart data
    const performanceChartData = {
        labels: performances.map((p) => p.topicName),
        datasets: [
            {
                label: 'Accuracy %',
                data: performances.map((p) => p.accuracy),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.75)',
                    'rgba(139, 92, 246, 0.75)',
                    'rgba(6, 182, 212, 0.75)',
                    'rgba(20, 184, 166, 0.75)',
                ],
                borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(139, 92, 246)',
                    'rgb(6, 182, 212)',
                    'rgb(20, 184, 166)',
                ],
                borderWidth: 1.5,
                borderRadius: 10,
            },
        ],
    };

    const competencyChartData = {
        labels: ['Strong', 'Medium', 'Weak'],
        datasets: [
            {
                data: [
                    performances.filter((p) => p.competency === 'strong').length,
                    performances.filter((p) => p.competency === 'medium').length,
                    performances.filter((p) => p.competency === 'weak').length,
                ],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: ['rgb(99, 102, 241)', 'rgb(6, 182, 212)', 'rgb(139, 92, 246)'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(15, 23, 42, 0.5)', font: { size: 11 } },
                border: { display: false },
            },
            y: {
                grid: { color: 'rgba(99, 102, 241, 0.06)' },
                ticks: { color: 'rgba(15, 23, 42, 0.4)', font: { size: 11 } },
                border: { display: false },
                max: 100,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'rgba(15, 23, 42, 0.6)',
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { size: 12 },
                },
            },
        },
        cutout: '70%',
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-extrabold text-slate-900" style={{ fontSize: '2rem', fontWeight: 800 }}>
                        Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'User'}</span>
                    </h1>
                    <p className="text-slate-500 text-[15px] mt-1 font-medium">Here's your learning progress overview</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Quizzes Taken" value={totalQuizzes} icon={BookOpen} color="primary" subtitle={`${quizzes.length} available`} />
                    <StatCard title="Avg. Accuracy" value={`${avgAccuracy.toFixed(0)}%`} icon={Target} color="emerald" subtitle={avgAccuracy >= 70 ? 'Great performance!' : 'Keep practicing!'} />
                    <StatCard title="Strong Topics" value={strongTopics.length} icon={TrendingUp} color="amber" subtitle={strongTopics.map(t => t.topicName).join(', ') || 'None yet'} />
                    <StatCard title="Streak" value={streak > 0 ? `${streak} day${streak > 1 ? 's' : ''}` : 'Start today!'} icon={Flame} color="red" subtitle={streak > 0 ? "Keep it going!" : "Take a quiz to begin"} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Performance Chart */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <h2 className="text-[17px] font-bold text-slate-900 mb-5">Topic Performance</h2>
                        <div className="h-64">
                            <Bar data={performanceChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Competency Breakdown */}
                    <div className="glass-card p-6">
                        <h2 className="text-[17px] font-bold text-slate-900 mb-5">Competency Overview</h2>
                        <div className="h-64">
                            <Doughnut data={competencyChartData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Attempts */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[17px] font-bold text-slate-900">Recent Attempts</h2>
                            <Link to="/quizzes" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {attempts.slice(0, 5).map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 transition-all duration-150"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-indigo-50">
                                            <BookOpen className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{attempt.quizTitle}</p>
                                            <p className="text-xs text-slate-400 font-medium">{attempt.language} • {new Date(attempt.startedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${attempt.accuracy >= 70 ? 'text-indigo-600' : attempt.accuracy >= 40 ? 'text-violet-600' : 'text-cyan-600'}`}>
                                            {attempt.accuracy.toFixed(0)}%
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium">{attempt.score}/{attempt.totalQuestions}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="glass-card p-6">
                        <h2 className="text-[17px] font-bold text-slate-900 mb-5">Topic Competency</h2>
                        <div className="space-y-3">
                            {performances.map((perf) => (
                                <div
                                    key={perf.topicId}
                                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{perf.topicName}</p>
                                        <p className="text-xs text-slate-400 font-medium">{perf.language}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${perf.competency === 'strong'
                                                    ? 'bg-indigo-500'
                                                    : perf.competency === 'medium'
                                                        ? 'bg-violet-400'
                                                        : 'bg-cyan-400'
                                                    }`}
                                                style={{ width: `${perf.accuracy}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs font-bold capitalize ${perf.competency === 'strong' ? 'text-indigo-600' : perf.competency === 'medium' ? 'text-violet-500' : 'text-cyan-600'}`}>
                                            {perf.competency}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            to="/quizzes"
                            className="btn-primary mt-6 w-full flex items-center justify-center gap-2 text-sm"
                        >
                            <BookOpen className="w-4 h-4" />
                            Start a New Quiz
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
