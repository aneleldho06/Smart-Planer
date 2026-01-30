import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isSameDay } from 'date-fns';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: number;
    scheduledTime?: string; // HH:mm format
    isPriority?: boolean;
}

interface TaskState {
    tasks: Task[];
    lastActiveDate: number;
    addTask: (title: string, scheduledTime?: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    checkDailyReset: () => void;
    togglePriority: (id: string) => void;
    notes: string;
    updateNotes: (content: string) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            lastActiveDate: Date.now(),
            notes: '',

            addTask: (title: string, scheduledTime?: string) => {
                const newTask: Task = {
                    id: crypto.randomUUID(),
                    title,
                    completed: false,
                    createdAt: Date.now(),
                    scheduledTime,
                };
                set((state) => ({ tasks: [newTask, ...state.tasks] }));
            },

            toggleTask: (id: string) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, completed: !t.completed } : t
                    ),
                }));
            },

            deleteTask: (id: string) => {
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));
            },

            togglePriority: (id: string) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, isPriority: !t.isPriority } : t
                    ),
                }));
            },

            updateNotes: (content: string) => {
                set({ notes: content });
            },

            checkDailyReset: () => {
                const { lastActiveDate } = get();
                const now = Date.now();

                // If not the same day, clear tasks
                if (!isSameDay(lastActiveDate, now)) {
                    console.log("New day detected, resetting tasks...");
                    set({
                        tasks: [],
                        lastActiveDate: now
                    });
                } else {
                    // Update last active date just to be sure we track usage
                    set({ lastActiveDate: now });
                }
            },
        }),
        {
            name: 'smartplan-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
