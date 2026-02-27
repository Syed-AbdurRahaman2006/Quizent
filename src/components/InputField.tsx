import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function InputField({ label, error, id, ...props }: InputFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
            </label>
            <input
                id={id}
                className={`w-full bg-slate-50 border rounded-[10px] px-4 py-3 text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${error
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15 hover:border-slate-300'
                    }`}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}
