import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getDemoQuizzes, getDemoQuestions, SEED_QUIZZES, getDemoTopics } from '../../utils/seedData';
import { getDifficultyLabel } from '../../utils/adaptiveEngine';
import { Quiz, Question, Difficulty } from '../../types';
import {
    Plus,
    Edit3,
    Trash2,
    ChevronDown,
    ChevronRight,
    BookOpen,
    Save,
    X,
    AlertCircle,
} from 'lucide-react';

interface QuestionForm {
    difficulty: Difficulty;
    questionText: string;
    options: string[];
    correctAnswer: number;
}

const emptyQuestion: QuestionForm = {
    difficulty: 'medium',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
};

export default function QuizManagement() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
    const [quizQuestions, setQuizQuestions] = useState<Record<string, Question[]>>({});
    const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
    const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestion);
    const [showNewQuestion, setShowNewQuestion] = useState<string | null>(null);
    const [showNewQuiz, setShowNewQuiz] = useState(false);
    const [newQuizForm, setNewQuizForm] = useState({ title: '', language: 'Java', topicName: '' });

    useEffect(() => {
        const demoQuizzes = getDemoQuizzes();
        setQuizzes(demoQuizzes);
        // Pre-load questions
        const qs: Record<string, Question[]> = {};
        demoQuizzes.forEach((q) => {
            qs[q.id] = getDemoQuestions(q.id);
        });
        setQuizQuestions(qs);
        setLoading(false);
    }, []);

    const handleExpandQuiz = (quizId: string) => {
        setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
        setEditingQuestion(null);
        setShowNewQuestion(null);
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question.id);
        setQuestionForm({
            difficulty: question.difficulty,
            questionText: question.questionText,
            options: [...question.options],
            correctAnswer: question.correctAnswer,
        });
    };

    const handleSaveQuestion = (quizId: string, questionId: string) => {
        setQuizQuestions((prev) => ({
            ...prev,
            [quizId]: prev[quizId].map((q) =>
                q.id === questionId
                    ? { ...q, ...questionForm }
                    : q
            ),
        }));
        setEditingQuestion(null);
    };

    const handleAddQuestion = (quizId: string) => {
        const newQ: Question = {
            id: `${quizId}_q_${Date.now()}`,
            quizId,
            ...questionForm,
        };
        setQuizQuestions((prev) => ({
            ...prev,
            [quizId]: [...(prev[quizId] || []), newQ],
        }));
        setShowNewQuestion(null);
        setQuestionForm(emptyQuestion);
    };

    const handleDeleteQuestion = (quizId: string, questionId: string) => {
        setQuizQuestions((prev) => ({
            ...prev,
            [quizId]: prev[quizId].filter((q) => q.id !== questionId),
        }));
    };

    const handleCreateQuiz = () => {
        const newQuiz: Quiz = {
            id: `quiz_${Date.now()}`,
            title: newQuizForm.title,
            topicId: `topic_new_${Date.now()}`,
            language: newQuizForm.language,
            createdBy: 'admin',
            createdAt: new Date(),
            questionCount: 0,
        };
        setQuizzes((prev) => [newQuiz, ...prev]);
        setQuizQuestions((prev) => ({ ...prev, [newQuiz.id]: [] }));
        setShowNewQuiz(false);
        setNewQuizForm({ title: '', language: 'Java', topicName: '' });
    };

    const handleDeleteQuiz = (quizId: string) => {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
        setQuizQuestions((prev) => {
            const copy = { ...prev };
            delete copy[quizId];
            return copy;
        });
    };

    if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-extrabold text-slate-900" style={{ fontSize: '2rem' }}>Quiz Management</h1>
                        <p className="text-slate-500 text-[15px] mt-1 font-medium">Create, edit, and manage quizzes</p>
                    </div>
                    <button
                        onClick={() => setShowNewQuiz(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Quiz
                    </button>
                </div>

                {/* New Quiz Form */}
                {showNewQuiz && (
                    <div className="glass-card p-6 mb-6 border-l-4 border-indigo-500">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Quiz</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="label-text">Quiz Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Java Arrays Fundamentals"
                                    value={newQuizForm.title}
                                    onChange={(e) => setNewQuizForm((f) => ({ ...f, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="label-text">Language</label>
                                <select
                                    className="input-field"
                                    value={newQuizForm.language}
                                    onChange={(e) => setNewQuizForm((f) => ({ ...f, language: e.target.value }))}
                                >
                                    <option value="Java">Java</option>
                                    <option value="Python">Python</option>
                                    <option value="JavaScript">JavaScript</option>
                                    <option value="C++">C++</option>
                                    <option value="Go">Go</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-text">Topic Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Arrays"
                                    value={newQuizForm.topicName}
                                    onChange={(e) => setNewQuizForm((f) => ({ ...f, topicName: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleCreateQuiz} disabled={!newQuizForm.title} className="btn-primary flex items-center gap-2">
                                <Save className="w-4 h-4" /> Create Quiz
                            </button>
                            <button onClick={() => setShowNewQuiz(false)} className="btn-secondary flex items-center gap-2">
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Quiz List */}
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="glass-card overflow-hidden">
                            {/* Quiz Header */}
                            <div
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => handleExpandQuiz(quiz.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedQuiz === quiz.id ? (
                                        <ChevronDown className="w-5 h-5 text-indigo-500" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    )}
                                    <div className="p-2 rounded-lg bg-indigo-50">
                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {quiz.language} • {quizQuestions[quiz.id]?.length || 0} questions
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-surface-200/30 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Questions */}
                            {expandedQuiz === quiz.id && (
                                <div className="border-t border-slate-100 p-5">
                                    <div className="space-y-3">
                                        {(quizQuestions[quiz.id] || []).map((question, idx) => (
                                            <div key={question.id}>
                                                {editingQuestion === question.id ? (
                                                    /* Edit Mode */
                                                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <select
                                                                className="input-field w-auto"
                                                                value={questionForm.difficulty}
                                                                onChange={(e) => setQuestionForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}
                                                            >
                                                                <option value="easy">Easy</option>
                                                                <option value="medium">Medium</option>
                                                                <option value="hard">Hard</option>
                                                            </select>
                                                        </div>
                                                        <textarea
                                                            className="input-field"
                                                            rows={2}
                                                            placeholder="Question text"
                                                            value={questionForm.questionText}
                                                            onChange={(e) => setQuestionForm((f) => ({ ...f, questionText: e.target.value }))}
                                                        />
                                                        {questionForm.options.map((opt, oi) => (
                                                            <div key={oi} className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="correct"
                                                                    checked={questionForm.correctAnswer === oi}
                                                                    onChange={() => setQuestionForm((f) => ({ ...f, correctAnswer: oi }))}
                                                                    className="accent-primary-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="input-field"
                                                                    placeholder={`Option ${oi + 1}`}
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const opts = [...questionForm.options];
                                                                        opts[oi] = e.target.value;
                                                                        setQuestionForm((f) => ({ ...f, options: opts }));
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleSaveQuestion(quiz.id, question.id)} className="btn-primary text-sm py-2">
                                                                <Save className="w-3.5 h-3.5 inline mr-1" /> Save
                                                            </button>
                                                            <button onClick={() => setEditingQuestion(null)} className="btn-secondary text-sm py-2">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* View Mode */
                                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 group transition-colors">
                                                        <span className="text-xs font-bold text-slate-400 mt-1 w-6">{idx + 1}.</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-slate-800 font-medium">{question.questionText}</p>
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                Answer: {question.options[question.correctAnswer]}
                                                            </p>
                                                        </div>
                                                        <span className={`badge shrink-0 ${question.difficulty === 'easy' ? 'badge-easy' :
                                                            question.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                                                            }`}>
                                                            {getDifficultyLabel(question.difficulty)}
                                                        </span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <button
                                                                onClick={() => handleEditQuestion(question)}
                                                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteQuestion(quiz.id, question.id)}
                                                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Question */}
                                    {showNewQuestion === quiz.id ? (
                                        <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-100 space-y-3">
                                            <h4 className="text-sm font-bold text-teal-700">New Question</h4>
                                            <div className="flex gap-3">
                                                <select
                                                    className="input-field w-auto"
                                                    value={questionForm.difficulty}
                                                    onChange={(e) => setQuestionForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                            <textarea
                                                className="input-field"
                                                rows={2}
                                                placeholder="Enter question text..."
                                                value={questionForm.questionText}
                                                onChange={(e) => setQuestionForm((f) => ({ ...f, questionText: e.target.value }))}
                                            />
                                            {questionForm.options.map((opt, oi) => (
                                                <div key={oi} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="newCorrect"
                                                        checked={questionForm.correctAnswer === oi}
                                                        onChange={() => setQuestionForm((f) => ({ ...f, correctAnswer: oi }))}
                                                        className="accent-emerald-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input-field"
                                                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const opts = [...questionForm.options];
                                                            opts[oi] = e.target.value;
                                                            setQuestionForm((f) => ({ ...f, options: opts }));
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddQuestion(quiz.id)}
                                                    disabled={!questionForm.questionText}
                                                    className="btn-primary text-sm py-2"
                                                >
                                                    <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Question
                                                </button>
                                                <button
                                                    onClick={() => { setShowNewQuestion(null); setQuestionForm(emptyQuestion); }}
                                                    className="btn-secondary text-sm py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setShowNewQuestion(quiz.id); setQuestionForm(emptyQuestion); }}
                                            className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Question
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {quizzes.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-500">No quizzes yet</h3>
                        <p className="text-sm text-slate-400 mt-1">Create your first quiz to get started.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
