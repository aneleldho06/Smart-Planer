import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Project {
    id: string;
    name: string;
    description?: string;
    emoji: string;
    createdAt: number;
}

interface ProjectState {
    projects: Project[];
    addProject: (name: string, emoji: string, description?: string) => void;
    deleteProject: (id: string) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            projects: [],
            addProject: (name: string, emoji: string, description?: string) => {
                const newProject: Project = {
                    id: crypto.randomUUID(),
                    name,
                    emoji,
                    description,
                    createdAt: Date.now(),
                };
                set((state) => ({ projects: [newProject, ...state.projects] }));
            },
            deleteProject: (id: string) => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                }));
            },
            updateProject: (id: string, updates: Partial<Project>) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                }));
            },
        }),
        {
            name: 'smartplan-projects',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
