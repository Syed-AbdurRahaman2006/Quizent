import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDemoQuizzes, getDemoQuestions, SEED_QUIZZES } from '../utils/seedData';
import { getNextDifficulty, selectNextQuestion, getDifficultyLabel } from '../utils/adaptiveEngine';
import { Question, Difficulty, Answer, Quiz } from '../types';
import { Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { saveQuizProgress, clearQuizProgress } from '../utils/storage';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

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
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const [showExplanation, setShowExplanation] = useState(false);

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
            setQuestionStartTime(Date.now());
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
        setShowExplanation(false);
        setQuestionNumber((n) => n + 1);
        setQuestionStartTime(Date.now()); // Reset question timer
    }, [currentQuestion, answers, currentDifficulty, questionNumber, answeredIds, questions]);

    const handleSubmitAnswer = useCallback(() => {
        if (selectedOption === null || !currentQuestion) return;

        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        const timeSpent = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));

        const answer: Answer = {
            id: `ans_${answers.length}`,
            attemptId: 'current',
            questionId: currentQuestion.id,
            selectedOption,
            isCorrect,
            difficulty: currentQuestion.difficulty,
            timeSpent,
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

        // Removed auto-advance because it causes stale closures on handleNextQuestion
        // User will click the Next Button instead, allowing them to read explanations
    }, [selectedOption, currentQuestion, answers, quiz, quizId, questionNumber, timeElapsed, questionStartTime, handleNextQuestion]);

    const handleViewResults = () => {
        const correct = answers.filter((a) => a.isCorrect).length;
        const accuracy = (correct / answers.length) * 100;
        const seedQuiz = SEED_QUIZZES.find((sq) => sq.title === quiz?.title);
        const topicName = seedQuiz?.topicName || quiz?.title || 'Unknown';

        // Complete migration: Save directly to Firestore ONLY
        const saveToFirestore = async () => {
            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    let finalName = user?.name || currentUser.displayName || 'User';
                    let finalEmail = user?.email || currentUser.email || 'anonymous';

                    // Priority: Fetch verified real name / email from the explicit `users` table
                    try {
                        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            if (data.name || data.fullName) finalName = data.name || data.fullName;
                            if (data.email) finalEmail = data.email;
                        }
                    } catch (e) { /* Fallback to auth */ }

                    const breakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
                    answers.forEach((a) => {
                        const d = a.difficulty as 'easy' | 'medium' | 'hard';
                        if (breakdown[d]) {
                            breakdown[d].total += 1;
                            if (a.isCorrect) breakdown[d].correct += 1;
                        }
                    });

                    // Exact Firestore Schema explicitly requested
                    const attempt = {
                        userId: currentUser.uid,
                        userName: finalName,
                        userEmail: finalEmail,
                        quizId: quizId,
                        language: quiz?.language || 'JavaScript',
                        topic: topicName,
                        score: correct,
                        totalQuestions: answers.length,
                        accuracy,
                        timeTaken: timeElapsed,
                        difficultyBreakdown: breakdown,
                        createdAt: serverTimestamp() // native firestore timestamp
                    };

                    await addDoc(collection(db, "quizAttempts"), attempt);
                }
            } catch (err) {
                console.error("Failed to save attempt to Firestore:", err);
            }
        };

        saveToFirestore().then(() => {
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
        });
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
        const incorrect = answers.length - correct;
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

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center">
                                <p className="text-2xl font-extrabold text-emerald-600">{correct}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Correct</p>
                            </div>
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center">
                                <p className="text-2xl font-extrabold text-red-600">{incorrect}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Incorrect</p>
                            </div>
                            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 flex flex-col items-center justify-center">
                                <p className={`text-2xl font-extrabold ${accuracy >= 70 ? 'text-indigo-600' : accuracy >= 40 ? 'text-violet-600' : 'text-cyan-600'}`}>
                                    {accuracy.toFixed(0)}%
                                </p>
                                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Accuracy</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                                <p className="text-2xl font-extrabold text-slate-700">{formatTime(timeElapsed)}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Total Time</p>
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
                    <div className="flex flex-col gap-3 mb-6">
                        <div className={`glass-card p-4 border-l-4 ${isCorrect ? 'border-l-emerald-500 bg-emerald-50' : 'border-l-red-500 bg-red-50'}`}>
                            <div className="flex items-center gap-2">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <span className="font-bold text-emerald-600">Correct Answer</span>
                                    </>
                                ) : (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <XCircle className="w-5 h-5 text-red-600" />
                                            <span className="font-bold text-red-600">Incorrect</span>
                                        </div>
                                        <span className="text-red-500 font-medium">
                                            Correct Answer: {currentQuestion.options[currentQuestion.correctAnswer]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isCorrect && currentQuestion.explanation && (
                            <div className="flex flex-col items-start gap-3">
                                <button
                                    onClick={() => setShowExplanation(!showExplanation)}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                    {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                                </button>

                                {showExplanation && (
                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-5">
                                        <p className="text-sm font-semibold text-slate-700 mb-1">Explanation:</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {currentQuestion.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end mt-4">
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
