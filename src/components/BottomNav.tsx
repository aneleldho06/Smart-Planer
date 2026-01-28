import React from 'react';
import { LayoutList, CalendarDays, CalendarRange, Sparkles } from 'lucide-react';
import { useUIStore, type ViewType } from '../stores/uiStore';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
    const { currentView, setView } = useUIStore();

    const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
        { id: 'today', label: 'Today', icon: <LayoutList size={24} /> },
        { id: 'weekly', label: 'Week', icon: <CalendarDays size={24} /> },
        { id: 'monthly', label: 'Month', icon: <CalendarRange size={24} /> },
        { id: 'ai', label: 'AI', icon: <Sparkles size={24} /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
            <div className="glass-panel mx-auto flex h-16 max-w-md items-center justify-around rounded-2xl md:max-w-xl">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
                            currentView === item.id
                                ? "text-primary scale-110"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                    >
                        {item.icon}
                        <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                        {currentView === item.id && (
                            <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary" />
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
};
