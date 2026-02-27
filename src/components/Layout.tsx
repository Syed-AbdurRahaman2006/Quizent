import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-indigo-100 px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
