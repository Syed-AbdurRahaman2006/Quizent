import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDemoQuizzes, getDemoQuestions, SEED_QUIZZES } from '../utils/seedData';
import { getNextDifficulty, selectNextQuestion, getDifficultyLabel } from '../utils/adaptiveEngine';
import { Question, Difficulty, Answer, Quiz } from '../types';
import { Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { saveQuizResult, saveQuizProgress, clearQuizProgress } from '../utils/storage';

export default function QuizPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('medium');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
    const [questionNumber, setQuestionNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [quizComplete, setQuizComplete] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const MAX_QUESTIONS = 9;

    useEffect(() => {
        if (!quizId) return;
        const demoQuizzes = getDemoQuizzes();
        const foundQuiz = demoQuizzes.find((q) => q.id === quizId);
        if (foundQuiz) {
            setQuiz(foundQuiz);
            const qs = getDemoQuestions(quizId);
            setQuestions(qs);
            // Start with medium
            const firstQ = selectNextQuestion(qs, 'medium', new Set());
            setCurrentQuestion(firstQ);
        }
        setLoading(false);
    }, [quizId]);

    // Timer
    useEffect(() => {
        if (quizComplete || loading) return;
        const interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
        return () => clearInterval(interval);
    }, [quizComplete, loading]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = (index: number) => {
        if (showResult) return;
        setSelectedOption(index);
    };

    const handleSubmitAnswer = useCallback(() => {
        if (selectedOption === null || !currentQuestion) return;

        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        const answer: Answer = {
            id: `ans_${answers.length}`,
            attemptId: 'current',
            questionId: currentQuestion.id,
            selectedOption,
            isCorrect,
            difficulty: currentQuestion.difficulty,
            timestamp: new Date(),
        };

        const updatedAnswers = [...answers, answer];
        setAnswers(updatedAnswers);
        setAnsweredIds((prev) => new Set(prev).add(currentQuestion.id));
        setShowResult(true);

        // Persist progress to sessionStorage so refresh doesn't lose answers
        if (quiz && quizId) {
            const seedQuiz = SEED_QUIZZES.find((sq) => sq.title === quiz.title);
            saveQuizProgress({
                quizId,
                quizTitle: quiz.title,
                language: quiz.language,
                topicName: seedQuiz?.topicName || quiz.title,
                questionNumber,
                answers: updatedAnswers,
                timeElapsed,
            });
        }
    }, [selectedOption, currentQuestion, answers, quiz, quizId, questionNumber, timeElapsed]);

    const handleNextQuestion = useCallback(() => {
        if (!currentQuestion) return;

        const lastAnswer = answers[answers.length - 1];
        const nextDifficulty = getNextDifficulty(currentDifficulty, lastAnswer.isCorrect);
        setCurrentDifficulty(nextDifficulty);

        if (questionNumber >= MAX_QUESTIONS) {
            setQuizComplete(true);
            return;
        }

        const newAnsweredIds = new Set(answeredIds);
        newAnsweredIds.add(currentQuestion.id);

        const nextQ = selectNextQuestion(questions, nextDifficulty, newAnsweredIds);
        if (!nextQ) {
            setQuizComplete(true);
            return;
        }

        setCurrentQuestion(nextQ);
        setSelectedOption(null);
        setShowResult(false);
        setQuestionNumber((n) => n + 1);
    }, [currentQuestion, answers, currentDifficulty, questionNumber, answeredIds, questions]);

    const handleViewResults = () => {
        const correct = answers.filter((a) => a.isCorrect).length;
        const accuracy = (correct / answers.length) * 100;
        const seedQuiz = SEED_QUIZZES.find((sq) => sq.title === quiz?.title);
        const topicName = seedQuiz?.topicName || quiz?.title || 'Unknown';

        // Persist attempt permanently to localStorage
        saveQuizResult({
            quizId: quizId!,
            quizTitle: quiz?.title || '',
            language: quiz?.language || '',
            topicName,
            userId: user?.id || 'anonymous',
            answers,
            totalQuestions: answers.length,
            timeElapsed,
        });

        // Clear session progress now that quiz is done
        clearQuizProgress();

        // Pass rich data to Results page via sessionStorage
        sessionStorage.setItem('quizResults', JSON.stringify({
            quizId,
            quizTitle: quiz?.title,
            language: quiz?.language,
            topicName,
            answers,
            score: correct,
            totalQuestions: answers.length,
            accuracy,
            timeElapsed,
        }));

        navigate(`/results/${quizId}`);
    };

    if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;

    if (!quiz) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto text-center py-20">
                    <AlertCircle className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900">Quiz Not Found</h2>
                    <p className="text-slate-500 mt-2">The quiz you're looking for doesn't exist.</p>
                    <button onClick={() => navigate('/quizzes')} className="btn-primary mt-6">
                        Browse Quizzes
                    </button>
                </div>
            </Layout>
        );
    }

    if (quizComplete) {
        const correct = answers.filter((a) => a.isCorrect).length;
        const accuracy = (correct / answers.length) * 100;

        return (
            <Layout>
                <div className="max-w-2xl mx-auto py-8">
                    <div className="glass-card p-8 text-center">
                        <div className="inline-flex p-5 rounded-2xl bg-amber-50 border border-amber-100 mb-6">
                            <Trophy className="w-12 h-12 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Quiz Complete!</h2>
                        <p className="text-slate-500 mb-8">{quiz.title}</p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                <p className="text-2xl font-extrabold text-indigo-600">{correct}/{answers.length}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Score</p>
                            </div>
                            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                                <p className={`text-2xl font-extrabold ${accuracy >= 70 ? 'text-indigo-600' : accuracy >= 40 ? 'text-violet-600' : 'text-cyan-600'}`}>
                                    {accuracy.toFixed(0)}%
                                </p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Accuracy</p>
                            </div>
                            <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
                                <p className="text-2xl font-extrabold text-teal-600">{formatTime(timeElapsed)}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Time</p>
                            </div>
                        </div>

                        <button onClick={handleViewResults} className="btn-primary flex items-center gap-2 mx-auto">
                            View Detailed Results
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!currentQuestion) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto text-center py-20">
                    <AlertCircle className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                    <p className="text-slate-500">No questions available for this quiz.</p>
                </div>
            </Layout>
        );
    }

    const isCorrect = showResult && selectedOption === currentQuestion.correctAnswer;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-4">
                {/* Quiz header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">{quiz.title}</p>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                            Question {questionNumber}<span className="text-slate-400 font-medium">/{MAX_QUESTIONS}</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`badge ${currentDifficulty === 'easy' ? 'badge-easy' : currentDifficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                            }`}>
                            {getDifficultyLabel(currentDifficulty)}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                            <Clock className="w-4 h-4" />
                            {formatTime(timeElapsed)}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(questionNumber / MAX_QUESTIONS) * 100}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="glass-card p-6 md:p-8 mb-6">
                    <p className="text-[17px] font-semibold text-slate-900 leading-relaxed mb-6">{currentQuestion.questionText}</p>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            let optionClasses = 'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none';

                            if (showResult) {
                                if (index === currentQuestion.correctAnswer) {
                                    optionClasses += ' bg-emerald-50 border-emerald-400 text-emerald-800';
                                } else if (index === selectedOption && !isCorrect) {
                                    optionClasses += ' bg-red-50 border-red-400 text-red-800';
                                } else {
                                    optionClasses += ' bg-slate-50 border-slate-100 text-slate-400';
                                }
                            } else if (selectedOption === index) {
                                optionClasses += ' bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20';
                            } else {
                                optionClasses += ' bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50';
                            }

                            return (
                                <div
                                    key={index}
                                    className={optionClasses}
                                    onClick={() => handleSelectOption(index)}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${showResult && index === currentQuestion.correctAnswer
                                        ? 'bg-emerald-500 text-white'
                                        : showResult && index === selectedOption && !isCorrect
                                            ? 'bg-red-500 text-white'
                                            : selectedOption === index
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="flex-1 font-medium">{option}</span>
                                    {showResult && index === currentQuestion.correctAnswer && (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    )}
                                    {showResult && index === selectedOption && !isCorrect && (
                                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback */}
                {showResult && (
                    <div className={`glass-card p-4 mb-6 border-l-4 ${isCorrect ? 'border-l-emerald-500 bg-emerald-50' : 'border-l-red-400 bg-red-50'}`}>
                        <div className="flex items-center gap-2">
                            {isCorrect ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-bold text-emerald-700">Correct!</span>
                                    <span className="text-emerald-600 text-sm">Great job!</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <span className="font-bold text-red-600">Incorrect</span>
                                    <span className="text-red-500 text-sm">
                                        The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                    {!showResult ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedOption === null}
                            className="btn-primary flex items-center gap-2"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="btn-primary flex items-center gap-2"
                        >
                            {questionNumber >= MAX_QUESTIONS ? 'Finish Quiz' : 'Next Question'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Answer History */}
                <div className="mt-8 flex items-center gap-2 flex-wrap">
                    {answers.map((a, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${a.isCorrect
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                                }`}
                        >
                            {i + 1}
                        </div>
                    ))}
                    {questionNumber <= MAX_QUESTIONS && !quizComplete && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-indigo-600 text-white animate-pulse shadow-md shadow-indigo-500/30">
                            {questionNumber}
                        </div>
                    )}
                    {Array.from({ length: Math.max(0, MAX_QUESTIONS - questionNumber) }, (_, i) => (
                        <div
                            key={`future_${i}`}
                            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200"
                        />
                    ))}
                </div>
            </div>
        </Layout>
    );
}
