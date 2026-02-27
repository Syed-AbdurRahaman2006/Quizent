import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface MockCaptchaProps {
    onVerify: (verified: boolean) => void;
}

export default function MockCaptcha({ onVerify }: MockCaptchaProps) {
    const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

    const handleVerify = () => {
        if (status !== 'idle') return;

        setStatus('verifying');
        // Simulate a brief verification delay for authenticity
        setTimeout(() => {
            setStatus('verified');
            onVerify(true);
        }, 800);
    };

    return (
        <div className="w-[304px] h-[78px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] flex items-center px-3 relative overflow-hidden group select-none transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-3 flex-1 h-full cursor-pointer" onClick={handleVerify}>
                <div className={`w-6 h-6 border-2 rounded-[2px] flex items-center justify-center transition-all duration-300 ${status === 'verified'
                        ? 'bg-[#4285f4] border-[#4285f4]'
                        : 'bg-white border-[#c1c1c1]'
                    }`}>
                    {status === 'verifying' && (
                        <Loader2 className="w-4 h-4 text-[#4285f4] animate-spin" />
                    )}
                    {status === 'verified' && (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <span className="text-[#333] text-[14px] font-normal">I'm not a robot</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 opacity-80">
                <div className="bg-white p-1 rounded-full shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-[#4285f4]" />
                </div>
                <div className="flex flex-col items-center -space-y-1">
                    <span className="text-[10px] text-[#555] font-bold">Mock</span>
                    <span className="text-[8px] text-[#777]">Privacy - Terms</span>
                </div>
            </div>

            {/* Subtle glow effect on hover */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#4285f4]/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </div>
    );
}
