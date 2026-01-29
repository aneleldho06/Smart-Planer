import React from 'react';
import { useTaskStore } from '../stores/taskStore';
import { format } from 'date-fns';

export const TimelineSection: React.FC = () => {
    const { tasks } = useTaskStore();

    // Generate time slots from 8 AM to 8 PM
    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

    const getTaskForTime = (hour: number) => {
        return tasks.find(t => {
            if (!t.scheduledTime) return false;
            const taskHour = parseInt(t.scheduledTime.split(':')[0]);
            return taskHour === hour && !t.completed;
        });
    };

    return (
        <div className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl p-4">
            <div className="mb-4 flex flex-col items-center">
                <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                    {/* Binder rings simulation */}
                    <div className="absolute -top-1 left-4 h-3 w-1.5 rounded-full bg-slate-800" />
                    <div className="absolute -top-1 right-4 h-3 w-1.5 rounded-full bg-slate-800" />

                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                        {format(new Date(), 'MMMM')}
                    </span>
                    <span className="text-3xl font-black leading-none">
                        {format(new Date(), 'd')}
                    </span>
                </div>
            </div>

            <div className="glass-card flex-1 overflow-y-auto rounded-xl p-0">
                <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 bg-indigo-50/50 backdrop-blur-md dark:bg-slate-800/50">
                        <tr>
                            <th className="border-b border-indigo-100 p-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">TIME</th>
                            <th className="border-b border-indigo-100 p-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">ACTIVITY</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50 dark:divide-slate-700/50">
                        {timeSlots.map((hour) => {
                            const task = getTaskForTime(hour);
                            const isNoon = hour === 12;
                            const displayTime = isNoon ? 'Noon' : `${hour > 12 ? hour - 12 : hour}:00`;

                            return (
                                <tr key={hour} className="group hover:bg-white/30 dark:hover:bg-slate-700/30">
                                    <td className="w-16 border-r border-indigo-50 py-3 pl-3 text-xs font-medium text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                        {displayTime}
                                    </td>
                                    <td className="p-2 text-xs text-slate-700 dark:text-slate-300">
                                        {task ? (
                                            <span className="line-clamp-1 rounded bg-teal-100/50 px-2 py-1 font-medium text-teal-800 dark:bg-teal-900/30 dark:text-teal-200">
                                                {task.title}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-600">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
