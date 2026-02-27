import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, BookOpen, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { db } from '../../lib/firebase';
import { getDemoQuizzes } from '../../utils/seedData';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, Filler);

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        totalAttempts: 0,
        uniqueUsers: 0,
        avgAccuracy: 0,
        topicAccuracy: [] as { topic: string; accuracy: number }[],
        completionRates: [] as { month: string; rate: number }[],
        difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
        recentAttempts: [] as { user: string; quiz: string; accuracy: number; date: string }[],
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "quizAttempts"), async (attemptsSnap) => {
            try {
                const stored: any[] = [];
                attemptsSnap.forEach(doc => {
                    stored.push({ id: doc.id, ...doc.data() });
                });

                // Cast firestore objects slightly
                const normalized = stored.map(a => ({
                    ...a,
                    startedAt: a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.date || Date.now())
                }));

                const avgAccuracy = normalized.length > 0
                    ? Math.round(normalized.reduce((s, a) => s + a.accuracy, 0) / normalized.length)
                    : 0;

                // Inline: Topic Accuracy Map
                const map: Record<string, { totalAccuracy: number; count: number }> = {};
                normalized.forEach((a) => {
                    const topic = a.topic || 'Unknown';
                    if (!map[topic]) map[topic] = { totalAccuracy: 0, count: 0 };
                    map[topic].totalAccuracy += a.accuracy;
                    map[topic].count += 1;
                });

                const performances = Object.entries(map).map(([topic, v]) => ({
                    topic,
                    accuracy: Math.round(v.totalAccuracy / v.count)
                }));

                const uniqueUsers = [...new Set(normalized.map(a => a.userId))].length;

                // Build last-6-months completion rate (attempts per month)
                const now = new Date();
                const months: { month: string; rate: number }[] = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const label = d.toLocaleString('default', { month: 'short' });
                    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    const count = normalized.filter((a) => {
                        const mString = `${a.startedAt.getFullYear()}-${String(a.startedAt.getMonth() + 1).padStart(2, '0')}`;
                        return mString === monthStr;
                    }).length;
                    months.push({ month: label, rate: count });
                }

                // Difficulty distribution
                let easyCount = 0, mediumCount = 0, hardCount = 0;
                normalized.forEach(a => {
                    if (a.difficultyBreakdown) {
                        easyCount += a.difficultyBreakdown.easy?.total || 0;
                        mediumCount += a.difficultyBreakdown.medium?.total || 0;
                        hardCount += a.difficultyBreakdown.hard?.total || 0;
                    }
                });

                const totalAns = (easyCount + mediumCount + hardCount) || 1;
                const diffDist = {
                    easy: Math.round((easyCount / totalAns) * 100) || 33,
                    medium: Math.round((mediumCount / totalAns) * 100) || 34,
                    hard: Math.round((hardCount / totalAns) * 100) || 33,
                };

                // Fetch Real User Profiles for UIDs
                const userProfilesMap: Record<string, { name: string, email: string }> = {};
                const uniqueUids = Array.from(new Set(normalized.map(a => String(a.userId))));

                await Promise.all(uniqueUids.map(async (uid) => {
                    if (!uid || uid === 'anonymous') return;
                    try {
                        const userDoc = await getDoc(doc(db, "users", uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            userProfilesMap[uid] = {
                                name: data.name || data.fullName || 'Unknown User',
                                email: data.email || 'No Email'
                            };
                        }
                    } catch (e) { /* ignore single fetch errors */ }
                }));

                setStats({
                    totalQuizzes: getDemoQuizzes().length,
                    totalAttempts: normalized.length,
                    uniqueUsers,
                    avgAccuracy,
                    topicAccuracy: performances.map((p) => ({ topic: p.topic, accuracy: p.accuracy })),
                    completionRates: months,
                    difficultyDistribution: diffDist,
                    recentAttempts: normalized.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime()).slice(0, 8).map((a) => {
                        // Priority: Explicit UserName stored in Attempt -> Firestore Profile Name -> Fallback Raw Email/UID
                        const fallbackName = userProfilesMap[String(a.userId)]?.name || a.userEmail || a.userId;
                        const finalDisplayName = (a.userName && a.userName !== 'User') ? a.userName : fallbackName;

                        return {
                            user: finalDisplayName === 'anonymous' ? 'Guest' : finalDisplayName,
                            quiz: a.topic,
                            accuracy: Math.round(a.accuracy),
                            date: a.startedAt.toISOString().slice(0, 10),
                        };
                    }),
                });
            } catch (err) {
                console.error("Failed to load admin stats:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;

    const topicChartData = {
        labels: stats.topicAccuracy.map((t) => t.topic),
        datasets: [{
            label: 'Average Accuracy %',
            data: stats.topicAccuracy.map((t) => t.accuracy),
            backgroundColor: [
                'rgba(99, 102, 241, 0.75)',
                'rgba(139, 92, 246, 0.75)',
                'rgba(6, 182, 212, 0.75)',
                'rgba(20, 184, 166, 0.75)',
                'rgba(99, 102, 241, 0.55)',
                'rgba(139, 92, 246, 0.55)',
            ],
            borderColor: [
                'rgb(99, 102, 241)',
                'rgb(139, 92, 246)',
                'rgb(6, 182, 212)',
                'rgb(20, 184, 166)',
                'rgb(99, 102, 241)',
                'rgb(139, 92, 246)',
            ],
            borderWidth: 1.5,
            borderRadius: 10,
        }],
    };

    const completionChartData = {
        labels: stats.completionRates.map((c) => c.month),
        datasets: [{
            label: 'Attempts per Month',
            data: stats.completionRates.map((c) => c.rate),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(99, 102, 241)',
            pointBorderColor: 'rgb(99, 102, 241)',
            pointRadius: 4,
        }],
    };

    const difficultyChartData = {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
            data: [stats.difficultyDistribution.easy, stats.difficultyDistribution.medium, stats.difficultyDistribution.hard],
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(6, 182, 212, 0.8)',
                'rgba(139, 92, 246, 0.8)',
            ],
            borderColor: ['rgb(99, 102, 241)', 'rgb(6, 182, 212)', 'rgb(139, 92, 246)'],
            borderWidth: 2,
        }],
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

    const lineChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: true,
                position: 'top' as const,
                labels: { color: 'rgba(15, 23, 42, 0.5)', font: { size: 11 } },
            },
        },
        scales: {
            ...chartOptions.scales,
            y: { ...chartOptions.scales.y, max: undefined },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: 'rgba(15, 23, 42, 0.6)', padding: 16, usePointStyle: true, font: { size: 12 } },
            },
        },
        cutout: '65%',
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="flex items-center gap-2 font-extrabold text-slate-900" style={{ fontSize: '2rem' }}>
                        <BarChart3 className="w-8 h-8 text-indigo-600" /> Admin Dashboard
                    </h1>
                    <p className="text-slate-500 text-[15px] mt-1 font-medium">Platform analytics and user performance overview</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Attempts" value={stats.totalAttempts} icon={Trophy} color="amber" />
                    <StatCard title="Unique Users" value={stats.uniqueUsers} icon={Users} color="primary" />
                    <StatCard title="Avg. Accuracy" value={`${stats.avgAccuracy}%`} icon={TrendingUp} color="violet" />
                    <StatCard title="Topics Covered" value={stats.topicAccuracy.length} icon={BookOpen} color="emerald" />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="glass-card p-6">
                        <h3 className="text-[17px] font-bold text-slate-900 mb-5">Topic Mastery (All Users)</h3>
                        <div className="h-72">
                            <Bar data={topicChartData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="text-[17px] font-bold text-slate-900 mb-5">Quiz Completion Rate</h3>
                        <div className="h-72">
                            <Line data={completionChartData} options={lineChartOptions} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Difficulty Distribution */}
                    <div className="glass-card p-6">
                        <h3 className="text-[17px] font-bold text-slate-900 mb-5">Difficulty Distribution</h3>
                        <div className="h-64">
                            <Doughnut data={difficultyChartData} options={doughnutOptions} />
                        </div>
                    </div>

                    {/* Recent Attempts */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <h3 className="text-[17px] font-bold text-slate-900 mb-5">Recent Attempts</h3>
                        {stats.recentAttempts.length === 0 ? (
                            <div className="text-center py-12">
                                <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">No quiz attempts yet. Complete a quiz to see data here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="text-left py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Quiz</th>
                                            <th className="text-left py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</th>
                                            <th className="text-left py-3 px-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentAttempts.map((a, i) => (
                                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-slate-900">{a.user}</td>
                                                <td className="py-3 px-4 text-slate-500 font-medium">{a.quiz}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-bold text-sm ${a.accuracy >= 70 ? 'text-indigo-600' : a.accuracy >= 50 ? 'text-violet-500' : 'text-cyan-600'
                                                        }`}>
                                                        {a.accuracy}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-400 font-medium">{a.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
