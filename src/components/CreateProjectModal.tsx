import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ['📁', '📚', '💪', '💼', '🚀', '🎨', '🏠', '✈️', '🛒', '💡'];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('📁');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onCreate(title, selectedEmoji);
            setTitle('');
            setSelectedEmoji('📁');
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-4 right-4 top-1/2 z-[70] mx-auto max-w-sm -translate-y-1/2 transform rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl ring-1 ring-black/5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Project</h3>
                            <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Project Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setSelectedEmoji(emoji)}
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${selectedEmoji === emoji
                                                    ? 'bg-teal-100 ring-2 ring-teal-400 dark:bg-teal-900/30'
                                                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Project Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g., Exam Prep"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!title.trim()}
                                className="mt-2 w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Project
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
