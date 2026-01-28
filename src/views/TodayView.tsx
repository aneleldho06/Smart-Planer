import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { TaskCard } from '../components/TaskCard';
import { format } from 'date-fns';
import { Plus, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TodayView: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask, checkDailyReset } = useTaskStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');

    useEffect(() => {
        // Check for daily reset on mount
        checkDailyReset();

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Live clock
        return () => clearInterval(timer);
    }, [checkDailyReset]);

    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    // Sort active tasks by time if available
    const sortedActiveTasks = [...activeTasks].sort((a, b) => {
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    const completionPercentage = tasks.length > 0
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            addTask(newTaskTitle, newTaskTime);
            setNewTaskTitle('');
            setNewTaskTime('');
            setIsModalOpen(false);
        }
    };

    const getGreeting = () => {
        const hours = currentTime.getHours();
        if (hours < 12) return 'Good Morning!';
        if (hours < 18) return 'Good Afternoon!';
        return 'Good Evening!';
    };

    return (
        <div className="flex flex-col space-y-6 pb-24">
            {/* Header */}
            <header className="flex flex-col space-y-1">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-indigo-400">
                    {getGreeting()}
                </h2>
                <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {format(currentTime, 'EEEE, d MMM yyyy')}
                    </p>
                    <p className="text-2xl font-light text-slate-400 dark:text-slate-500 tabular-nums">
                        {format(currentTime, 'HH:mm')}
                    </p>
                </div>
            </header>

            {/* Progress */}
            <div className="glass-panel relative overflow-hidden rounded-2xl p-6 transition-all hover:shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Daily Progress</span>
                    <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/50">
                    <motion.div
                        className="h-full bg-gradient-to-r from-teal-400 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-right">
                    {completedTasks.length}/{tasks.length} tasks completed
                </p>
            </div>

            {/* Task List */}
            <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">To Do</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="glass-button flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                        <Plus size={14} /> Add Task
                    </button>
                </div>

                <AnimatePresence mode="popLayout">
                    {sortedActiveTasks.length === 0 && completedTasks.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-10 text-center text-slate-400 dark:text-slate-500"
                        >
                            <p>No tasks yet. Enjoy your day!</p>
                        </motion.div>
                    )}

                    {sortedActiveTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                    ))}

                    {completedTasks.length > 0 && (
                        <>
                            <div className="py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed</div>
                            {completedTasks.map((task) => (
                                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                            ))}
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Task Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-4 right-4 top-1/2 z-[70] mx-auto max-w-sm -translate-y-1/2 transform rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl ring-1 ring-black/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Task</h3>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                            <form onSubmit={handleAddTask} className="flex flex-col space-y-4">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="What needs to be done?"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                />
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-slate-400" />
                                    <input
                                        type="time"
                                        value={newTaskTime}
                                        onChange={(e) => setNewTaskTime(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newTaskTitle.trim()}
                                    className="mt-2 w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Task
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
