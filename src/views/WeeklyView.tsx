import React from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { useTaskStore } from '../stores/taskStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const WeeklyView: React.FC = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const { tasks } = useTaskStore();

    // Just for demo, we only have data for "today" really, 
    // unless we persist history which user didn't strictly ask for besides "localStorage ... only for current day"
    // So we'll show dots for today if there are tasks.

    return (
        <div className="flex flex-col space-y-6 pb-24">
            <header>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">This Week</h2>
                <p className="text-sm text-slate-500">{format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}</p>
            </header>

            <div className="glass-panel rounded-2xl p-4 overflow-x-auto">
                <div className="flex min-w-full justify-between gap-2">
                    {days.map((day, idx) => {
                        const isToday = isSameDay(day, today);
                        const hasTasks = isToday && tasks.length > 0;

                        return (
                            <motion.div
                                key={day.toISOString()}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={clsx(
                                    "flex flex-col items-center justify-center rounded-xl py-4 min-w-[50px] flex-1 transition-all",
                                    isToday
                                        ? "bg-primary text-white shadow-lg shadow-teal-500/30"
                                        : "bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-700/60"
                                )}
                            >
                                <span className={clsx("text-xs font-medium mb-1", isToday ? "text-white/80" : "text-slate-500")}>
                                    {format(day, 'EEE')}
                                </span>
                                <span className={clsx("text-lg font-bold", isToday ? "text-white" : "text-slate-800 dark:text-slate-200")}>
                                    {format(day, 'd')}
                                </span>

                                <div className="mt-2 h-1.5 w-1.5 rounded-full">
                                    {hasTasks && (
                                        <div className={clsx("h-1.5 w-1.5 rounded-full", isToday ? "bg-white" : "bg-primary")} />
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
                <div className="p-4 rounded-full bg-indigo-50 dark:bg-slate-800">
                    <span className="text-2xl">⚡️</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Weekly Focus</h3>
                    <p className="text-sm text-slate-500 max-w-[200px] mx-auto mt-1">
                        Review your progress and plan ahead. You're doing great!
                    </p>
                </div>
            </div>
        </div>
    );
};
