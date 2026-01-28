import React from 'react';
import type { Task } from '../stores/taskStore';
import { Check, Trash2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface TaskCardProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            className={clsx(
                "group relative flex items-center justify-between overflow-hidden rounded-xl border p-4 transition-all",
                task.completed
                    ? "bg-slate-100/50 dark:bg-slate-800/30 border-transparent opacity-60"
                    : "glass-card hover:border-primary/30 dark:hover:border-primary/30"
            )}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onToggle(task.id)}
                    className={clsx(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                        task.completed
                            ? "border-primary bg-primary text-white"
                            : "border-slate-300 hover:border-primary dark:border-slate-500"
                    )}
                >
                    {task.completed && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex flex-col">
                    <span
                        className={clsx(
                            "font-medium transition-all",
                            task.completed ? "text-slate-500 line-through dark:text-slate-500" : "text-slate-800 dark:text-slate-100"
                        )}
                    >
                        {task.title}
                    </span>
                    {task.scheduledTime && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock size={12} />
                            <span>{task.scheduledTime}</span>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => onDelete(task.id)}
                className="invisible group-hover:visible rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Delete task"
            >
                <Trash2 size={18} />
            </button>
        </motion.div>
    );
};
