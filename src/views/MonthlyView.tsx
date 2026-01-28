import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const MonthlyView: React.FC = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start); // 0 = Sun, 1 = Mon...

    // Mock Goals
    const goals = [
        { id: 1, title: 'Read 2 Books', progress: 65, color: 'bg-indigo-400' },
        { id: 2, title: 'Gym 12 Days', progress: 40, color: 'bg-rose-400' },
        { id: 3, title: 'Study React', progress: 80, color: 'bg-teal-400' },
    ];

    return (
        <div className="flex flex-col space-y-6 pb-24">
            <header>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{format(today, 'MMMM yyyy')}</h2>
                <p className="text-sm text-slate-500">Stay consistent with your monthly goals.</p>
            </header>

            {/* Calendar Grid */}
            <div className="glass-panel rounded-2xl p-4">
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-xs font-medium text-slate-400 py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {days.map((day) => {
                        const isToday = isSameDay(day, today);
                        return (
                            <div
                                key={day.toISOString()}
                                className={clsx(
                                    "aspect-square flex items-center justify-center rounded-lg text-sm",
                                    isToday
                                        ? "bg-primary text-white font-bold shadow-md"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                )}
                            >
                                {format(day, 'd')}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Goals */}
            <div className="flex flex-col space-y-3">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 ml-1">Monthly Goals</h3>
                {goals.map((goal, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={goal.id}
                        className="glass-card rounded-xl p-4"
                    >
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{goal.title}</span>
                            <span className="text-slate-500">{goal.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${goal.color}`}
                                style={{ width: `${goal.progress}%` }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
