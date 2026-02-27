import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, Search, ChevronDown, ChevronRight, BarChart3, BookOpen } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface UserData {
    id: string;
    name: string;
    email: string;
    totalAttempts: number;
    avgAccuracy: number;
    topicPerformances: { topic: string; accuracy: number }[];
    recentAttempts: { quiz: string; accuracy: number; date: string }[];
}

function buildUsersFromAttempts(attempts: any[], profilesMap: Record<string, { name: string, email: string }>): UserData[] {
    // Group by userId
    const map: Record<string, any[]> = {};
    attempts.forEach((a) => {
        const key = a.userId || 'anonymous';
        if (!map[key]) map[key] = [];
        map[key].push(a);
    });

    return Object.entries(map).map(([userId, userAttempts]) => {
        const avgAccuracy = userAttempts.length > 0
            ? Math.round(userAttempts.reduce((s, a) => s + a.accuracy, 0) / userAttempts.length)
            : 0;

        // Per-topic avg accuracy
        const topicMap: Record<string, { total: number; count: number }> = {};
        userAttempts.forEach((a) => {
            if (!topicMap[a.topic]) topicMap[a.topic] = { total: 0, count: 0 };
            topicMap[a.topic].total += a.accuracy;
            topicMap[a.topic].count += 1;
        });
        const topicPerformances = Object.entries(topicMap).map(([topic, v]) => ({
            topic,
            accuracy: Math.round(v.total / v.count),
        }));

        const fallbackName = profilesMap[userId]?.name || userId;
        const fallbackEmail = profilesMap[userId]?.email || (userId.includes('@') ? userId : `${userId}@quizent.app`);
        const finalName = userAttempts[0]?.userName && userAttempts[0].userName !== 'User' ? userAttempts[0].userName : fallbackName;
        const finalEmail = userAttempts[0]?.userEmail && userAttempts[0].userEmail !== 'anonymous' ? userAttempts[0].userEmail : fallbackEmail;

        return {
            id: userId,
            name: finalName === 'anonymous' ? 'Guest User' : finalName,
            email: finalEmail,
            totalAttempts: userAttempts.length,
            avgAccuracy,
            topicPerformances,
            recentAttempts: userAttempts.slice(0, 5).map((a) => {
                let dateStr = "Unknown";
                if (a.createdAt && typeof a.createdAt.toDate === 'function') {
                    dateStr = a.createdAt.toDate().toISOString().slice(0, 10);
                } else if (a.timestamp && typeof a.timestamp.toDate === 'function') {
                    dateStr = a.timestamp.toDate().toISOString().slice(0, 10);
                } else if (a.date && typeof a.date === 'string') {
                    dateStr = a.date.slice(0, 10);
                } else {
                    dateStr = new Date().toISOString().slice(0, 10);
                }

                return {
                    quiz: a.topic || 'Unknown',
                    accuracy: Math.round(a.accuracy || 0),
                    date: dateStr,
                };
            }),
        };
    });
}

export default function UserAnalytics() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "quizAttempts"), async (attemptsSnap) => {
            try {
                const stored: any[] = [];
                attemptsSnap.forEach(doc => stored.push({ id: doc.id, ...doc.data() }));

                // Sort attempts by timestamp natively so recents slice works correctly
                stored.sort((a, b) => {
                    let dateA = new Date(a.date || Date.now()).getTime();
                    let dateB = new Date(b.date || Date.now()).getTime();
                    // Schema update: use createdAt over timestamp
                    if (a.createdAt && typeof a.createdAt.toDate === 'function') dateA = a.createdAt.toDate().getTime();
                    if (b.createdAt && typeof b.createdAt.toDate === 'function') dateB = b.createdAt.toDate().getTime();
                    if (a.timestamp && typeof a.timestamp.toDate === 'function') dateA = a.timestamp.toDate().getTime();
                    if (b.timestamp && typeof b.timestamp.toDate === 'function') dateB = b.timestamp.toDate().getTime();
                    return dateB - dateA;
                });

                // Fetch Real User Profiles for UIDs
                const userProfilesMap: Record<string, { name: string, email: string }> = {};
                const uniqueUids = Array.from(new Set(stored.map(a => a.userId)));

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

                const userData = buildUsersFromAttempts(stored, userProfilesMap);
                setUsers(userData);
            } catch (err) {
                console.error("Failed to load user analytics:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getUserChartData = (user: UserData) => ({
        labels: user.topicPerformances.map((p) => p.topic),
        datasets: [{
            label: 'Accuracy %',
            data: user.topicPerformances.map((p) => p.accuracy),
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
            borderRadius: 8,
        }],
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(15, 23, 42, 0.5)', font: { size: 10 } },
                border: { display: false },
            },
            y: {
                grid: { color: 'rgba(99, 102, 241, 0.06)' },
                ticks: { color: 'rgba(15, 23, 42, 0.4)', font: { size: 10 } },
                border: { display: false },
                max: 100,
            },
        },
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="flex items-center gap-2 font-extrabold text-slate-900" style={{ fontSize: '2rem' }}>
                            <Users className="w-8 h-8 text-indigo-600" /> User Analytics
                        </h1>
                        <p className="text-slate-500 text-[15px] mt-1 font-medium">Monitor individual user performance</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>

                {/* User List */}
                {filteredUsers.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <BookOpen className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No quiz data yet</h3>
                        <p className="text-slate-500 font-medium">
                            {searchQuery ? 'No users match your search.' : 'Users will appear here after completing a quiz.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="glass-card overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/70 transition-colors"
                                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        {expandedUser === user.id ? (
                                            <ChevronDown className="w-5 h-5 text-indigo-500" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        )}
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{user.name}</h3>
                                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center hidden sm:block">
                                            <p className="font-bold text-indigo-600">{user.totalAttempts}</p>
                                            <p className="text-xs text-slate-400 font-medium">Attempts</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-bold ${user.avgAccuracy >= 70 ? 'text-indigo-600' : user.avgAccuracy >= 50 ? 'text-violet-500' : 'text-cyan-600'
                                                }`}>
                                                {user.avgAccuracy}%
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">Avg. Accuracy</p>
                                        </div>
                                    </div>
                                </div>

                                {expandedUser === user.id && (
                                    <div className="border-t border-slate-100 p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Chart */}
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <BarChart3 className="w-4 h-4 text-indigo-500" /> Topic Performance
                                                </h4>
                                                {user.topicPerformances.length > 0 ? (
                                                    <div className="h-48">
                                                        <Bar data={getUserChartData(user)} options={chartOptions} />
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-400 font-medium">No topic data yet</p>
                                                )}
                                            </div>

                                            {/* Recent Attempts */}
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700 mb-3">Recent Attempts</h4>
                                                <div className="space-y-2">
                                                    {user.recentAttempts.map((attempt, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-colors">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{attempt.quiz}</p>
                                                                <p className="text-xs text-slate-400 font-medium">{attempt.date}</p>
                                                            </div>
                                                            <span className={`text-sm font-bold ${attempt.accuracy >= 70 ? 'text-indigo-600' : attempt.accuracy >= 50 ? 'text-violet-500' : 'text-cyan-600'
                                                                }`}>
                                                                {attempt.accuracy}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
