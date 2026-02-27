import { useState } from 'react';

interface AuthTabsProps {
    activeTab: 'user' | 'admin';
    onTabChange: (tab: 'user' | 'admin') => void;
}

export default function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
    return (
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
                type="button"
                onClick={() => onTabChange('user')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
            >
                User
            </button>
            <button
                type="button"
                onClick={() => onTabChange('admin')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'admin'
                        ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/25'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
            >
                Admin
            </button>
        </div>
    );
}
