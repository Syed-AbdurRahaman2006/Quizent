import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: 'primary' | 'emerald' | 'amber' | 'red' | 'violet';
    children?: ReactNode;
}

const colorMap = {
    primary: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        iconBorder: 'ring-1 ring-indigo-100',
    },
    emerald: {
        bg: 'bg-teal-50',
        text: 'text-teal-600',
        iconBorder: 'ring-1 ring-teal-100',
    },
    amber: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        iconBorder: 'ring-1 ring-violet-100',
    },
    red: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        iconBorder: 'ring-1 ring-cyan-100',
    },
    violet: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        iconBorder: 'ring-1 ring-violet-100',
    },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', children }: StatCardProps) {
    const colors = colorMap[color];

    return (
        <div className="glass-card-hover p-6 cursor-default">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                    <p className="text-[2rem] font-extrabold text-slate-900 mt-1 leading-none">{value}</p>
                    {subtitle && <p className={`text-[12px] font-medium mt-2 ${colors.text}`}>{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-2xl ${colors.bg} ${colors.iconBorder} flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
            </div>
            {children}
        </div>
    );
}
