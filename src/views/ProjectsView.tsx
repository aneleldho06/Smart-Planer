import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useUIStore } from '../stores/uiStore';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { Plus, FolderOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';


export const ProjectsView: React.FC = () => {
    const { projects, tasks, fetchProjects, createProject } = useTaskStore();
    const { setView, setSelectedProjectId } = useUIStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleCreateProject = (title: string, emoji: string) => {
        createProject(title, emoji);
    };

    const handleProjectClick = (projectId: string) => {
        setSelectedProjectId(projectId);
        setView('project-detail');
    };

    // Calculate progress for a project
    const getProjectStats = (projectId: string) => {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        const completed = projectTasks.filter(t => t.completed).length;
        const total = projectTasks.length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { completed, total, percent };
    };

    if (projects.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="mb-6 rounded-3xl bg-teal-50 p-8 dark:bg-teal-900/20">
                    <FolderOpen size={64} className="text-teal-500" />
                </div>
                <h2 className="mb-2 text-3xl font-bold text-slate-800 dark:text-white">Your Projects Hub</h2>
                <p className="mb-8 max-w-md text-slate-500 dark:text-slate-400">
                    Organize your goals into projects and break big plans into small, achievable tasks.
                    Track progress, stay focused, and move forward faster.
                </p>
                <div className="space-y-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="glass-button flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold shadow-xl shadow-teal-500/20"
                    >
                        <Plus size={24} /> Create Your First Project
                    </button>
                    <CreateProjectModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onCreate={handleCreateProject}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full pb-20">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold uppercase text-slate-800 dark:text-slate-100">Projects</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="glass-button flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold"
                >
                    <Plus size={16} /> NEW PROJECT
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => {
                    const { completed, total, percent } = getProjectStats(project.id);
                    return (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleProjectClick(project.id)}
                            className="glass-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl dark:bg-slate-700/50">
                                    {project.emoji || '📁'}
                                </div>
                                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {completed} / {total} tasks
                                </div>
                            </div>

                            <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-slate-100">{project.title}</h3>
                            <p className="mb-4 text-xs text-slate-400">{percent}% completed</p>

                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    className="h-full rounded-full bg-teal-500"
                                />
                            </div>

                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                <ChevronRight className="text-slate-300" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
};
