import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isSameDay } from 'date-fns';
import { useAuthStore } from './authStore';

export interface Project {
    id: string;
    title: string;
    description?: string;
    emoji: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    scheduledTime?: string; // HH:mm format
    isPriority?: boolean;
    userId: string;
    taskDate: string; // ISO date string YYYY-MM-DD
    projectId?: string;
}

interface TaskState {
    tasks: Task[];
    projects: Project[];
    lastActiveDate: number;
    isLoading: boolean;

    // Actions
    fetchTasks: () => Promise<void>;
    fetchProjects: () => Promise<void>;
    addTask: (title: string, scheduledTime?: string, projectId?: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    togglePriority: (id: string) => Promise<void>;
    createProject: (title: string, emoji: string, description?: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;

    checkDailyReset: () => void;
    notes: string;
    updateNotes: (content: string) => void;
}

const getTodayISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    projects: [],
    lastActiveDate: Date.now(),
    notes: '',
    isLoading: false,

    fetchTasks: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true });

        // Fetch tasks for TODAY or tasks that belong to a project (we might want to filter project tasks separately later, but for MVP fetching all user tasks is okay if not too many)
        // Actually, let's fetch ALL tasks for now to simplify "Project Detail" view which needs tasks regardless of date.
        // Optimization: Maybe only fetch today's tasks + project tasks? For MVP, fetch all is safest.

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
        } else {
            console.log('Fetched tasks:', data);
            set({ tasks: data.map(mapRecord) });
        }
        set({ isLoading: false });
    },

    fetchProjects: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            set({ projects: data.map(mapProjectRecord) });
        }
    },

    addTask: async (title: string, scheduledTime?: string, projectId?: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const todayISO = getTodayISO();

        const newTaskDB = {
            user_id: user.id,
            title,
            completed: false,
            scheduled_time: scheduledTime || null,
            is_priority: false,
            task_date: todayISO,
            created_at: new Date().toISOString(),
            project_id: projectId || null
        };

        // Optimistic UI
        const optimisticId = crypto.randomUUID();
        const optimisticTask: Task = {
            id: optimisticId,
            title,
            completed: false,
            createdAt: newTaskDB.created_at,
            scheduledTime,
            isPriority: false,
            userId: user.id,
            taskDate: todayISO,
            projectId: projectId
        };

        set(state => ({
            tasks: [optimisticTask, ...state.tasks]
        }));

        const { data, error } = await supabase.from('tasks').insert(newTaskDB).select().single();

        if (error) {
            console.error('Add task error:', error);
            set(state => ({
                tasks: state.tasks.filter(t => t.id !== optimisticId)
            }));
            return;
        }

        set(state => ({
            tasks: state.tasks.map(t =>
                t.id === optimisticId ? mapRecord(data) : t
            )
        }));
    },

    createProject: async (title: string, emoji: string, description?: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const newProjectDB = {
            user_id: user.id,
            title,
            emoji,
            description,
            created_at: new Date().toISOString()
        };

        // Optimistic
        const optimisticId = crypto.randomUUID();
        const optimisticProject: Project = {
            id: optimisticId,
            title,
            emoji,
            description,
            createdAt: newProjectDB.created_at
        };

        set(state => ({ projects: [optimisticProject, ...state.projects] }));

        const { data, error } = await supabase.from('projects').insert(newProjectDB).select().single();

        if (error) {
            console.error('Create project error:', error);
            set(state => ({ projects: state.projects.filter(p => p.id !== optimisticId) }));
            return;
        }

        set(state => ({
            projects: state.projects.map(p => p.id === optimisticId ? mapProjectRecord(data) : p)
        }));
    },

    deleteProject: async (id: string) => {
        set(state => ({ projects: state.projects.filter(p => p.id !== id) }));
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) {
            console.error('Delete project error:', error);
            // Re-fetch to rollback strictly speaking, or just ignore for MVP
            get().fetchProjects();
        }
    },

    toggleTask: async (id: string, currentlyCompleted?: boolean) => { // retained signature flexible
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        const newStatus = !task.completed;

        // Optimistic
        set(state => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t)
        }));

        const { error } = await supabase
            .from('tasks')
            .update({ completed: newStatus })
            .eq('id', id);

        if (error) {
            console.error('Toggle task error:', error);
            set(state => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !newStatus } : t)
            }));
        }
    },

    deleteTask: async (id: string) => {
        const previousTasks = get().tasks;
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));

        const { error } = await supabase.from('tasks').delete().eq('id', id);

        if (error) {
            console.error('Delete task error:', error);
            set({ tasks: previousTasks });
        }
    },

    togglePriority: async (id: string, currentPriority?: boolean) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        const newPriority = !task.isPriority;

        set(state => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, isPriority: newPriority } : t)
        }));

        const { error } = await supabase
            .from('tasks')
            .update({ is_priority: newPriority })
            .eq('id', id);

        if (error) {
            console.error('Toggle priority error:', error);
            set(state => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, isPriority: !newPriority } : t)
            }));
        }
    },

    updateNotes: (content: string) => {
        set({ notes: content });
        // Optionally save notes to DB or localStorage if needed. For now just state (or persist middleware for just notes if we split it)
        localStorage.setItem('smartplan_notes', content);
        // Note: We removed the persist middleware for tasks/projects to rely on Supabase, but notes were local. 
        // Let's keep manual localStorage for notes for now to simplify.
    },

    checkDailyReset: () => {
        // With Supabase and task_date, we don't strictly need to "reset" the array, 
        // but we might want to refresh the fetch to ensure we see the right day's tasks.
        const { lastActiveDate } = get();
        const now = Date.now();
        if (!isSameDay(lastActiveDate, now)) {
            set({ lastActiveDate: now });
            // We could trigger a re-fetch here if we were filtering by day in the fetch
        }
    },
}));

// Helper to map DB record to Task
function mapRecord(record: any): Task {
    return {
        id: record.id,
        title: record.title,
        completed: record.completed,
        createdAt: record.created_at,
        scheduledTime: record.scheduled_time || undefined,
        isPriority: record.is_priority,
        userId: record.user_id,
        taskDate: record.task_date,
        projectId: record.project_id || undefined
    };
}

function mapProjectRecord(record: any): Project {
    return {
        id: record.id,
        title: record.title,
        description: record.description,
        emoji: record.emoji,
        createdAt: record.created_at
    };
}

// Initial fetch on store load if user exists
// (This is usually better done in a useEffect in App.tsx or Auth wrapper)

// Load notes
useTaskStore.setState({ notes: localStorage.getItem('smartplan_notes') || '' });
