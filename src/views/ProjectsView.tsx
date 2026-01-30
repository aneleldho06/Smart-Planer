import React, { useState } from 'react';
import { useProjectStore, type Project } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import { TaskCard } from '../components/TaskCard';
import { Plus, FolderPlus, ArrowLeft, LayoutGrid, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const EMOJI_OPTIONS = ['📚', '💪', '💼', '🎨', '🏠', '✈️', '💰', '🌱', '🎁', '🎮'];

export const ProjectsView: React.FC = () => {
    const { projects, addProject, deleteProject } = useProjectStore();
    const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();

    // UI State
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);

    // Computed
    const activeProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

    const projectStats = (projectId: string) => {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        const completed = projectTasks.filter(t => t.completed).length;
        const total = projectTasks.length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { completed, total, percent };
    };

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName.trim()) {
            addProject(newProjectName, selectedEmoji);
            setNewProjectName('');
            setIsCreateModalOpen(false);
        }
    };

    // Sub-view: Project List
    if (!activeProject) {
        return (
            <div className="flex h-full flex-col">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-800 dark:text-slate-100">Projects</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your big goals</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="glass-button flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                    >
                        <Plus size={18} /> NEW PROJECT
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                    {projects.length === 0 ? (
                        <EmptyState onCreate={() => setIsCreateModalOpen(true)} />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                            {projects.map((project) => {
                                const { total, percent } = projectStats(project.id);
                                return (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className="glass-card group relative cursor-pointer overflow-hidden rounded-3xl p-6"
                                    >
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-700/50">
                                                    {project.emoji || '📁'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{project.name}</h3>
                                                    <p className="text-xs text-slate-500">{total} tasks</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                                className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-semibold text-slate-500">
                                                <span>Progress</span>
                                                <span>{percent}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                <div
                                                    className="h-full rounded-full bg-teal-400 transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {isCreateModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsCreateModalOpen(false)}
                                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="fixed left-4 right-4 top-1/2 z-[70] mx-auto max-w-sm -translate-y-1/2 transform rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-800"
                            >
                                <h3 className="mb-4 text-center text-xl font-bold dark:text-white">New Project</h3>
                                <form onSubmit={handleCreateProject} className="space-y-4">
                                    <div className="flex justify-center mb-4">
                                        <div className="grid grid-cols-5 gap-2">
                                            {EMOJI_OPTIONS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => setSelectedEmoji(emoji)}
                                                    className={clsx(
                                                        "flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all",
                                                        selectedEmoji === emoji ? "bg-teal-100 ring-2 ring-teal-500 dark:bg-teal-900/50" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    )}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Project Name (e.g. Exam Prep)"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                    />

                                    <button
                                        type="submit"
                                        disabled={!newProjectName.trim()}
                                        className="w-full rounded-xl bg-teal-500 py-3 font-bold text-white shadow-lg transition-all hover:bg-teal-600 disabled:opacity-50"
                                    >
                                        Create Project
                                    </button>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Sub-view: Project Detail
    return (
        <ProjectDetailView
            project={activeProject}
            tasks={tasks.filter(t => t.projectId === activeProject.id)}
            onBack={() => setSelectedProjectId(null)}
            onAddTask={(title) => addTask(title, undefined, activeProject.id)}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
        />
    );
};

// --- Sub Components ---

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-3xl bg-teal-50 p-8 dark:bg-teal-900/20">
            <LayoutGrid size={48} className="text-teal-500" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">Your Projects Hub</h3>
        <p className="mb-8 max-w-xs text-slate-500 dark:text-slate-400">
            Organize your goals into projects and break big plans into small, achievable tasks.
        </p>
        <button
            onClick={onCreate}
            className="group relative flex items-center gap-3 rounded-2xl bg-teal-500 px-8 py-4 font-bold text-white shadow-xl shadow-teal-500/20 transition-all hover:scale-105 hover:bg-teal-400"
        >
            <Plus size={20} className="transition-transform group-hover:rotate-90" />
            <span>Create Your First Project</span>
        </button>
    </div>
);

const ProjectDetailView = ({
    project,
    tasks,
    onBack,
    onAddTask,
    onToggleTask,
    onDeleteTask
}: {
    project: Project,
    tasks: any[], // Using any[] for Task to avoid circular type ref issues for now or reuse Task interface
    onBack: () => void,
    onAddTask: (title: string) => void,
    onToggleTask: (id: string) => void,
    onDeleteTask: (id: string) => void
}) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            onAddTask(newTaskTitle);
            setNewTaskTitle('');
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
                        <span>{project.emoji}</span>
                        <span>{project.name}</span>
                    </h2>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-teal-500">{progress}% Done</p>
                    <p className="text-xs text-slate-400">{completedCount}/{tasks.length} tasks</p>
                </div>
            </div>

            {/* Quick Add Task */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="glass-card flex items-center gap-3 rounded-2xl p-2 pr-4 transition-all focus-within:ring-2 focus-within:ring-teal-500/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <Plus size={20} />
                    </div>
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder={`Add a task to ${project.name}...`}
                        className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none dark:text-slate-200"
                    />
                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="text-xs font-bold text-teal-500 disabled:opacity-50"
                    >
                        ADD
                    </button>
                </div>
            </form>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-20 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-slate-400 opacity-60">
                        <FolderPlus size={48} className="mb-2" />
                        <p>No tasks yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggle={onToggleTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
