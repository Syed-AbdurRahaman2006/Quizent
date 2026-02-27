import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAIRecommendations } from '../services/gemini';
import { calculateDifficultyBreakdown, determineCompetency, getCompetencyColor, getDifficultyLabel } from '../utils/adaptiveEngine';
import { Answer, AIRecommendation, TopicPerformance, Competency } from '../types';
import {
    Trophy,
    Target,
    Brain,
    TrendingUp,
    Sparkles,
    BookOpen,
    ArrowLeft,
    Lightbulb,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, RadialLinearScale);

interface QuizResultData {
    quizId: string;
    quizTitle: string;
    language: string;
    answers: Answer[];
    score: number;
    totalQuestions: number;
    accuracy: number;
    timeElapsed: number;
}

export default function Results() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState<QuizResultData | null>(null);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation | null>(null);
    const [loadingAI, setLoadingAI] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('quizResults');
        if (stored) {
            const data = JSON.parse(stored) as QuizResultData;
            setResultData(data);
            setLoading(false);

            // Get AI recommendations
            const performances: TopicPerformance[] = [
                {
                    topicId: 'topic_0',
                    topicName: data.quizTitle || 'Quiz Topic',
                    language: data.language || 'Programming',
                    accuracy: data.accuracy,
                    competency: determineCompetency(data.accuracy),
                    attemptsCount: 1,
                },
            ];

            getAIRecommendations(performances)
                .then((rec) => setAiRecommendations(rec))
                .catch(console.error)
                .finally(() => setLoadingAI(false));
        } else {
            setLoading(false);
        }
    }, [quizId]);

    if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;

    if (!resultData) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto text-center py-20">
                    <Trophy className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900">No Results Found</h2>
                    <p className="text-slate-500 mt-2">Take a quiz to see your results here.</p>
                    <button onClick={() => navigate('/quizzes')} className="btn-primary mt-6">
                        Browse Quizzes
                    </button>
                </div>
            </Layout>
        );
    }

    const { answers, score, totalQuestions, accuracy, timeElapsed, quizTitle, language } = resultData;
    const breakdown = calculateDifficultyBreakdown(answers);
    const competency = determineCompetency(accuracy);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Chart data
    const difficultyChartData = {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [
            {
                label: 'Correct',
                data: [breakdown.easy.correct, breakdown.medium.correct, breakdown.hard.correct],
                backgroundColor: 'rgba(99, 102, 241, 0.75)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1.5,
                borderRadius: 8,
            },
            {
                label: 'Incorrect',
                data: [
                    breakdown.easy.total - breakdown.easy.correct,
                    breakdown.medium.total - breakdown.medium.correct,
                    breakdown.hard.total - breakdown.hard.correct,
                ],
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 1.5,
                borderRadius: 8,
            },
        ],
    };

    const accuracyChartData = {
        labels: ['Correct', 'Incorrect'],
        datasets: [{
            data: [score, totalQuestions - score],
            backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(6, 182, 212, 0.5)'],
            borderColor: ['rgb(99, 102, 241)', 'rgb(6, 182, 212)'],
            borderWidth: 2,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: 'rgba(15,23,42,0.6)', padding: 12, usePointStyle: true, font: { size: 11 } },
            },
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
                stacked: true,
            },
            y: {
                grid: { color: 'rgba(99, 102, 241, 0.06)' },
                ticks: { color: 'rgba(15, 23, 42, 0.4)', stepSize: 1, font: { size: 11 } },
                border: { display: false },
                stacked: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: 'rgba(15,23,42,0.6)', padding: 16, usePointStyle: true, font: { size: 12 } },
            },
        },
        cutout: '70%',
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="glass-card p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className={`p-4 rounded-2xl ${competency === 'strong' ? 'bg-indigo-50 border border-indigo-100' :
                                competency === 'medium' ? 'bg-violet-50 border border-violet-100' :
                                    'bg-cyan-50 border border-cyan-100'
                            }`}>
                            <Trophy className={`w-10 h-10 ${competency === 'strong' ? 'text-indigo-600' : competency === 'medium' ? 'text-violet-600' : 'text-cyan-600'}`} />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl font-extrabold text-slate-900">{quizTitle}</h1>
                            <p className="text-slate-500 font-medium mt-1">{language} • Completed in {formatTime(timeElapsed)}</p>
                        </div>
                        <div className="md:ml-auto">
                            <span className={`text-2xl font-extrabold ${competency === 'strong' ? 'text-indigo-600' : competency === 'medium' ? 'text-violet-600' : 'text-cyan-600'
                                }`}>
                                {competency.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-5 text-center">
                        <Target className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-2xl font-extrabold text-slate-900">{score}/{totalQuestions}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Score</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${competency === 'strong' ? 'text-indigo-600' : competency === 'medium' ? 'text-violet-600' : 'text-cyan-600'}`} />
                        <p className={`text-2xl font-extrabold ${competency === 'strong' ? 'text-indigo-600' : competency === 'medium' ? 'text-violet-600' : 'text-cyan-600'}`}>{accuracy.toFixed(0)}%</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Accuracy</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <Brain className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                        <p className="text-2xl font-extrabold text-violet-600">{totalQuestions}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Questions</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-2xl font-extrabold text-amber-500">
                            {breakdown.hard.total > 0 ? Math.round((breakdown.hard.correct / breakdown.hard.total) * 100) : 0}%
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Hard Q Accuracy</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="glass-card p-6">
                        <h3 className="text-[17px] font-bold text-slate-900 mb-5">Difficulty Breakdown</h3>
                        <div className="h-64">
                            <Bar data={difficultyChartData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="text-[17px] font-bold text-slate-900 mb-5">Overall Accuracy</h3>
                        <div className="h-64">
                            <Doughnut data={accuracyChartData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                {/* Answer Review */}
                <div className="glass-card p-6 mb-6">
                    <h3 className="text-[17px] font-bold text-slate-900 mb-5">Answer Review</h3>
                    <div className="space-y-2">
                        {answers.map((answer, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between p-3.5 rounded-xl border ${answer.isCorrect
                                        ? 'bg-indigo-50 border-indigo-100'
                                        : 'bg-red-50 border-red-100'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {answer.isCorrect ? (
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    )}
                                    <span className="text-sm font-semibold text-slate-900">Question {i + 1}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`badge ${answer.difficulty === 'easy' ? 'badge-easy' :
                                        answer.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                                        }`}>
                                        {getDifficultyLabel(answer.difficulty)}
                                    </span>
                                    <span className={`text-sm font-bold ${answer.isCorrect ? 'text-indigo-600' : 'text-red-500'}`}>
                                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="glass-card p-6 border-l-4 border-l-violet-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-violet-50 border border-violet-100">
                            <Sparkles className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="text-[17px] font-bold text-slate-900">AI-Powered Insights</h3>
                            <p className="text-xs text-slate-500 font-medium">Personalized recommendations by Gemini</p>
                        </div>
                    </div>

                    {loadingAI ? (
                        <div className="flex items-center gap-3 p-4">
                            <LoadingSpinner size="sm" />
                            <span className="text-slate-500 font-medium">Analyzing your performance...</span>
                        </div>
                    ) : aiRecommendations ? (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-slate-700 leading-relaxed">{aiRecommendations.summary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Strengths
                                    </h4>
                                    {aiRecommendations.strengths.map((s, i) => (
                                        <p key={i} className="text-sm text-slate-600 pl-6">• {s}</p>
                                    ))}
                                </div>

                                {/* Weaknesses */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-amber-600 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Areas to Improve
                                    </h4>
                                    {aiRecommendations.weaknesses.map((w, i) => (
                                        <p key={i} className="text-sm text-slate-600 pl-6">• {w}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h4 className="text-sm font-bold text-indigo-600 flex items-center gap-2 mb-3">
                                    <Lightbulb className="w-4 h-4" /> Recommendations
                                </h4>
                                <div className="space-y-2">
                                    {aiRecommendations.recommendations.map((r, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                                            <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {i + 1}
                                            </span>
                                            <p className="text-sm text-slate-700">{r}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Study Plan */}
                            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                                <h4 className="text-sm font-bold text-violet-700 flex items-center gap-2 mb-2">
                                    <BookOpen className="w-4 h-4" /> Study Plan
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed">{aiRecommendations.studyPlan}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-400">Unable to generate recommendations. Try again later.</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 mt-6">
                    <button onClick={() => navigate('/quizzes')} className="btn-primary flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Take Another Quiz
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </Layout>
    );
}
