import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useUIStore } from '../stores/uiStore';
import { TaskCard } from '../components/TaskCard';
import { TimelineSection } from '../components/TimelineSection';
import { PrioritiesSection } from '../components/PrioritiesSection';
import { NotesSection } from '../components/NotesSection';
import { HeartMotivation } from '../components/HeartMotivation';
import { Plus, X, Clock, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { LogOut } from 'lucide-react';

export const TodayView: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask, checkDailyReset, fetchTasks, subscribeToTasks, unsubscribeFromTasks } = useTaskStore();
    const { theme, toggleTheme } = useUIStore();
    const { user, signOut } = useAuthStore();  // Add user from authStore to check logged in

    // Local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');

    useEffect(() => {
        if (user) {  // Only fetch/subscribe if logged in
            fetchTasks();
            subscribeToTasks();
            checkDailyReset();
        }
        return () => unsubscribeFromTasks();  // Cleanup on unmount
    }, [user, fetchTasks, subscribeToTasks, unsubscribeFromTasks, checkDailyReset]);

    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    // Sort active tasks by time if available
    const sortedActiveTasks = [...activeTasks].sort((a, b) => {
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            addTask(newTaskTitle, newTaskTime);
            setNewTaskTitle('');
            setNewTaskTime('');
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] w-full flex-col gap-6 md:flex-row">

            {/* LEFT COLUMN: Timeline */}
            <div className="w-full md:w-1/4">
                <h2 className="mb-4 text-center text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    Today's Schedule
                </h2>
                <div className="h-[calc(100%-3rem)]">
                    <TimelineSection />
                </div>
            </div>

            {/* MIDDLE COLUMN: To-Do List */}
            <div className="flex w-full flex-col md:w-2/4">
                <div className="glass-panel relative flex h-full flex-col overflow-hidden rounded-3xl p-6 shadow-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold uppercase text-slate-800 dark:text-slate-100">To-Do List</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={!user}  // Disable if not logged in
                            className="glass-button flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> ADD TASK
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        <AnimatePresence mode="popLayout">
                            {sortedActiveTasks.length === 0 && completedTasks.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex h-40 items-center justify-center text-slate-400 dark:text-slate-500"
                                >
                                    <p>No tasks yet. Plan your day!</p>
                                </motion.div>
                            )}

                            {sortedActiveTasks.map((task) => (
                                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                            ))}

                            {completedTasks.length > 0 && (
                                <>
                                    <div className="py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                                        Completed
                                    </div>
                                    {completedTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                                    ))}
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Heart Section */}
                    <div className="mt-4 border-t border-slate-200 pt-2 dark:border-slate-700/50">
                        <HeartMotivation />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Priorities, Notes, Theme Toggle */}
            <div className="flex w-full flex-col md:w-1/4">
                <div className="mb-4 flex items-center justify-end gap-4">
                    <h2 className="flex-1 text-center text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Overview
                    </h2>
                    {/* Theme Toggle Widget */}
                    <div className="flex gap-2">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 rounded-full glass-card px-3 py-1.5 transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            {theme === 'light' ? (
                                <>
                                    <Sun size={16} className="text-amber-500" />
                                    <span className="text-xs font-bold text-slate-600">DAY</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={16} className="text-indigo-400" />
                                    <span className="text-xs font-bold text-slate-300">NIGHT</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-2 rounded-full glass-card px-3 py-1.5 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 group"
                            title="Sign Out"
                        >
                            <LogOut size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(100%-3rem)] flex-col">
                    <PrioritiesSection />
                    <NotesSection />
                </div>
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