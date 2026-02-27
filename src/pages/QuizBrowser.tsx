import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDemoQuizzes, getDemoTopics } from '../utils/seedData';
import { Quiz, Topic } from '../types';
import { Search, Filter, BookOpen, Code2 } from 'lucide-react';

export default function QuizBrowser() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setQuizzes(getDemoQuizzes());
        setTopics(getDemoTopics());
        setLoading(false);
    }, []);

    if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;

    const languages = ['all', ...new Set(quizzes.map((q) => q.language))];

    const filteredQuizzes = quizzes.filter((q) => {
        const matchesLanguage = selectedLanguage === 'all' || q.language === selectedLanguage;
        const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLanguage && matchesSearch;
    });

    // Group by language
    const groupedQuizzes = filteredQuizzes.reduce<Record<string, Quiz[]>>((acc, q) => {
        if (!acc[q.language]) acc[q.language] = [];
        acc[q.language].push(q);
        return acc;
    }, {});

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-extrabold text-slate-900" style={{ fontSize: '2rem' }}>Browse Quizzes</h1>
                    <p className="text-slate-500 text-[15px] mt-1 font-medium">Choose a topic and test your knowledge</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {languages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedLanguage === lang
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                {lang === 'all' ? (
                                    <span className="flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> All</span>
                                ) : (
                                    <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> {lang}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quiz Grid */}
                {Object.keys(groupedQuizzes).length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <BookOpen className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-500">No quizzes found</h3>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    Object.entries(groupedQuizzes).map(([language, langQuizzes]) => (
                        <div key={language} className="mb-8">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="p-1.5 rounded-lg bg-indigo-50">
                                    <Code2 className="w-4 h-4 text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">{language}</h2>
                                <span className="text-sm text-slate-400 font-medium">({langQuizzes.length} {langQuizzes.length === 1 ? 'quiz' : 'quizzes'})</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {langQuizzes.map((quiz) => (
                                    <QuizCard key={quiz.id} quiz={quiz} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
}
