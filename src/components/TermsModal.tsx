import React from 'react';
import { X, ScrollText, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                            <ScrollText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Terms & Conditions</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Last updated Feb 2026</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <section>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            1. Acceptance of Terms
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed pl-6">
                            By accessing Quizent, you agree to be bound by these terms. Our platform provides adaptive learning assessments powered by high-performance data models. Any misuse or automated scraping is strictly prohibited.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            2. Use License
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed pl-6">
                            Permission is granted to use Quizent for personal, non-commercial educational purposes. This is a grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="text-sm text-slate-600 list-disc pl-10 mt-2 space-y-1">
                            <li>Modify or copy source code elements</li>
                            <li>Attempt to decompile or reverse engineer any software</li>
                            <li>Use our data models for commercial gain without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            3. Account Security
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed pl-6">
                            You are responsible for maintaining the confidentiality of your account credentials. Admins have specific oversight rights to ensure platform integrity and verify quiz analytics.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            4. Privacy Policy
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed pl-6">
                            Your performance data and local insights are processed to enhance your learning experience. We do not sell your personal information to third parties.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10"
                    >
                        Got it, I understand
                    </button>
                </div>
            </div>
        </div>
    );
}
