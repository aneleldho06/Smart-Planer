import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isSameDay, format } from 'date-fns';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string; // Changed to string (ISO) for better compatibility
    scheduledTime?: string;
    isPriority?: boolean;
    userId?: string;
    taskDate: string; // YYYY-MM-DD
}

interface TaskState {
    tasks: Task[];
    loading: boolean;
    lastActiveDate: number;
    fetchTasks: () => Promise<void>;
    addTask: (title: string, scheduledTime?: string) => Promise<void>;
    toggleTask: (id: string, currentStatus?: boolean) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    togglePriority: (id: string, currentPriority?: boolean) => Promise<void>;
    updateNotes: (content: string) => void;
    checkDailyReset: () => void;
    subscribeToTasks: () => void;
    unsubscribeFromTasks: () => void;
    notes: string;
}

export const useTaskStore = create<TaskState>((set, get) => {
    let realtimeChannel: RealtimeChannel | null = null;

    // Helper to map DB snake_case record to Task interface
    const mapRecord = (r: any): Task => ({
        id: r.id,
        title: r.title,
        completed: r.completed,
        createdAt: r.created_at, // Expecting ISO string from DB now
        scheduledTime: r.scheduled_time,
        isPriority: r.is_priority,
        userId: r.user_id,
        taskDate: r.task_date
    });

    const getTodayISO = () => format(new Date(), 'yyyy-MM-dd');

    return {
        tasks: [],
        loading: false,
        lastActiveDate: Date.now(),
        notes: '',

        fetchTasks: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ tasks: [], loading: false });
                return;
            }

            set({ loading: true });
            const todayISO = getTodayISO();

            // Use task_date for filtering if available, otherwise fallback to created_at range
            // We prioritize task_date as it's timezone safe for "days"
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .eq('task_date', todayISO)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error);
                set({ loading: false });
                return;
            }

            console.log('Fetched tasks:', data);
            set({ tasks: data ? data.map(mapRecord) : [], loading: false });
        },

        addTask: async (title: string, scheduledTime?: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('User not authenticated');
                return;
            }

            const todayISO = getTodayISO();
            const nowISO = new Date().toISOString();

            const newTaskDB = {
                user_id: user.id,
                title,
                completed: false,
                created_at: nowISO,            // Send ISO string
                task_date: todayISO,           // Explicit date column
                scheduled_time: scheduledTime || null,
                is_priority: false
            };

            console.log('Adding task:', newTaskDB);

            // Optimistic update: Add to UI immediately
            const optimisticId = crypto.randomUUID();
            const optimisticTask: Task = {
                id: optimisticId,
                title,
                completed: false,
                createdAt: nowISO,
                scheduledTime: scheduledTime,
                isPriority: false,
                userId: user.id,
                taskDate: todayISO
            };

            set(state => ({ tasks: [optimisticTask, ...state.tasks] }));

            const { data, error } = await supabase.from('tasks').insert(newTaskDB).select();

            if (error) {
                console.error('Error adding task to Supabase:', error);
                // Rollback on error
                set(state => ({ tasks: state.tasks.filter(t => t.id !== optimisticId) }));
                return;
            }

            // Replace optimistic task with real one
            if (data && data[0]) {
                const realTask = mapRecord(data[0]);
                set(state => ({
                    tasks: state.tasks.map(t => t.id === optimisticId ? realTask : t)
                }));
            }
        },

        toggleTask: async (id: string, currentStatus: boolean | undefined) => {
            // If currentStatus is provided, use it. Otherwise look it up.
            let nextStatus = !currentStatus;

            if (currentStatus === undefined) {
                const task = get().tasks.find(t => t.id === id);
                if (task) nextStatus = !task.completed;
                else return; // Can't find task
            }

            // Optimistic Update
            set(state => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, completed: nextStatus } : t)
            }));

            const { error } = await supabase
                .from('tasks')
                .update({ completed: nextStatus })
                .eq('id', id);

            if (error) {
                console.error('Error toggling task:', error);
                // Rollback
                set(state => ({
                    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !nextStatus } : t)
                }));
            }
        },

        deleteTask: async (id: string) => {
            const previousTasks = get().tasks;

            // Optimistic Update
            set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));

            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting task:', error);
                set({ tasks: previousTasks }); // Rollback
            }
        },

        togglePriority: async (id: string, currentPriority?: boolean) => {
            let nextPriority = !currentPriority;

            if (currentPriority === undefined) {
                const task = get().tasks.find(t => t.id === id);
                if (task) nextPriority = !task.isPriority;
                else return;
            }

            // Optimistic Update
            set(state => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, isPriority: nextPriority } : t)
            }));

            const { error } = await supabase
                .from('tasks')
                .update({ is_priority: nextPriority })
                .eq('id', id);

            if (error) {
                console.error('Error toggling priority:', error);
                // Rollback
                set(state => ({
                    tasks: state.tasks.map(t => t.id === id ? { ...t, isPriority: !nextPriority } : t)
                }));
            }
        },

        updateNotes: (content: string) => {
            set({ notes: content });
        },

        checkDailyReset: () => {
            const { lastActiveDate, fetchTasks } = get();
            const now = Date.now();

            if (!isSameDay(lastActiveDate, now)) {
                console.log("New day detected, refreshing tasks...");
                set({ lastActiveDate: now });
                fetchTasks();
            }
        },

        subscribeToTasks: () => {
            if (realtimeChannel) return;

            console.log('Subscribing to realtime tasks...');
            // Need to ensure auth state is valid or rely on RLS

            realtimeChannel = supabase
                .channel('tasks_channel')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'tasks'
                    // filter: `user_id=eq.${user?.id}` // Ideally filter by user if RLS doesn't handle realtime filtering automatically (it does, but explicit is safer if RLS off)
                }, (payload) => {
                    console.log('Realtime payload received:', payload);
                    const { eventType, new: newRecord, old: oldRecord } = payload;
                    const todayISO = getTodayISO();

                    const isToday = (record: any) => {
                        // Check task_date first
                        if (record.task_date) {
                            return record.task_date === todayISO;
                        }
                        // Fallback to parsing created_at if task_date missing
                        if (record.created_at) {
                            try {
                                return format(new Date(record.created_at), 'yyyy-MM-dd') === todayISO;
                            } catch (e) {
                                console.error('Error parsing date:', e);
                                return false;
                            }
                        }
                        return false;
                    };

                    set((state) => {
                        if (eventType === 'INSERT') {
                            if (isToday(newRecord)) {
                                // De-duplicate: Check if we already have this ID (from optimistic update)
                                const exists = state.tasks.some(t => t.id === newRecord.id);
                                if (exists) {
                                    // If it exists, we might want to update it to ensure it matches DB exactly
                                    return {
                                        tasks: state.tasks.map(t => t.id === newRecord.id ? mapRecord(newRecord) : t)
                                    };
                                }
                                return { tasks: [mapRecord(newRecord), ...state.tasks] };
                            }
                        } else if (eventType === 'DELETE') {
                            return { tasks: state.tasks.filter((t) => t.id !== oldRecord.id) };
                        } else if (eventType === 'UPDATE') {
                            if (isToday(newRecord)) {
                                return {
                                    tasks: state.tasks.map((t) =>
                                        t.id === newRecord.id ? mapRecord(newRecord) : t
                                    )
                                };
                            } else {
                                // If task moved to another date or was unassigned (unlikely but possible)
                                return { tasks: state.tasks.filter(t => t.id !== newRecord.id) };
                            }
                        }
                        return state;
                    });
                })
                .subscribe((status) => {
                    console.log('Realtime subscription status:', status);
                    if (status === 'SUBSCRIBED') {
                        // Good practice to fetch once connected to ensure we didn't miss anything while connecting
                        // get().fetchTasks(); 
                    }
                });
        },

        unsubscribeFromTasks: () => {
            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
                realtimeChannel = null;
            }
        },
    };
});

// Need to import useAuthStore to get user ID inside subscribe without hook rules
import { useAuthStore } from './authStore';
