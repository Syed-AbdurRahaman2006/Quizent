import { Quiz } from '../types';
import { BookOpen, Clock, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizCardProps {
    quiz: Quiz;
}

const langColor: Record<string, { bg: string; text: string; dot: string }> = {
    Java: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
    Python: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
    JavaScript: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
    'C++': { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400' },
    Go: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-400' },
};

export default function QuizCard({ quiz }: QuizCardProps) {
    const navigate = useNavigate();
    const lang = langColor[quiz.language] ?? { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400' };

    return (
        <div
            className="glass-card-hover p-6 cursor-pointer group"
            onClick={() => navigate(`/quiz/${quiz.id}`)}
        >
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-200 mt-0.5" />
            </div>

            {/* Title */}
            <h3 className="font-semibold text-slate-900 text-[15px] leading-snug group-hover:text-indigo-600 transition-colors mb-1">
                {quiz.title}
            </h3>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.questionCount || '~9'} questions
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${lang.bg} ${lang.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${lang.dot}`} />
                    {quiz.language}
                </span>
            </div>
        </div>
    );
}
