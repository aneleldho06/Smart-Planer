import React from 'react';
import { useTaskStore } from '../stores/taskStore';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PrioritiesSection: React.FC = () => {
    const { tasks, toggleTask, togglePriority } = useTaskStore();

    const priorityTasks = tasks.filter(t => t.isPriority && !t.completed);

    return (
        <div className="glass-panel flex h-[45%] flex-col overflow-hidden rounded-2xl p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                <Star className="fill-yellow-400 text-yellow-400" size={20} />
                PRIORITIES
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {priorityTasks.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                            <p className="text-sm">No priorities set.</p>
                            <p className="text-xs opacity-70">Star a task to see it here.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {priorityTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card group flex items-start gap-3 rounded-xl p-3"
                                >
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className="mt-0.5 text-slate-400 transition-colors hover:text-primary dark:text-slate-500"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {task.title}
                                        </p>
                                        {task.scheduledTime && (
                                            <p className="text-xs text-slate-400">{task.scheduledTime}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => togglePriority(task.id)}
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
