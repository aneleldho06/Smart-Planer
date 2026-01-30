import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isSameDay, format } from 'date-fns';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    scheduledTime?: string;
    isPriority?: boolean;
    userId?: string;
    taskDate: string;
}

interface TaskState {
    tasks: Task[];
    loading: boolean;
    lastActiveDate: Date;
    notes: string;

    fetchTasks: () => Promise<void>;
    addTask: (title: string, scheduledTime?: string) => Promise<void>;
    toggleTask: (id: string, currentStatus?: boolean) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    togglePriority: (id: string, currentPriority?: boolean) => Promise<void>;
    updateNotes: (content: string) => void;
    checkDailyReset: () => void;
    subscribeToTasks: () => void;
    unsubscribeFromTasks: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => {
    let realtimeChannel: RealtimeChannel | null = null;

    const mapRecord = (r: any): Task => ({
        id: r.id,
        title: r.title,
        completed: r.completed,
        createdAt: r.created_at,
        scheduledTime: r.scheduled_time,
        isPriority: r.is_priority,
        userId: r.user_id,
        taskDate: r.task_date
    });

    const getTodayISO = () => format(new Date(), 'yyyy-MM-dd');

    return {
        tasks: [],
        loading: false,
        lastActiveDate: new Date(),
        notes: '',

        fetchTasks: async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                set({ tasks: [], loading: false });
                return;
            }

            set({ loading: true });

            const todayISO = getTodayISO();

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)  // Added: Explicit user_id filter
                .eq('task_date', todayISO)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Fetch tasks error:', error);
                set({ loading: false });
                return;
            }

            set({ tasks: data?.map(mapRecord) || [], loading: false });
        },

        addTask: async (title: string, scheduledTime?: string) => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const todayISO = getTodayISO();

            const newTaskDB = {
                user_id: user.id,
                title,
                completed: false,
                task_date: todayISO,
                scheduled_time: scheduledTime || null,
                is_priority: false
            };

            // Optimistic UI
            const optimisticId = crypto.randomUUID();

            set(state => ({
                tasks: [{
                    id: optimisticId,
                    title,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    scheduledTime,
                    isPriority: false,
                    userId: user.id,
                    taskDate: todayISO
                }, ...state.tasks]
            }));

            const { data, error } = await supabase
                .from('tasks')
                .insert(newTaskDB)
                .select()
                .single();

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

        toggleTask: async (id: string, currentStatus?: boolean) => {
            const task = get().tasks.find(t => t.id === id);
            if (!task) return;

            const nextStatus = currentStatus ?? !task.completed;

            set(state => ({
                tasks: state.tasks.map(t =>
                    t.id === id ? { ...t, completed: nextStatus } : t
                )
            }));

            const { error } = await supabase
                .from('tasks')
                .update({ completed: nextStatus })
                .eq('id', id);

            if (error) {
                console.error('Toggle error:', error);
                set(state => ({
                    tasks: state.tasks.map(t =>
                        t.id === id ? { ...t, completed: !nextStatus } : t
                    )
                }));
            }
        },

        deleteTask: async (id: string) => {
            const previous = get().tasks;

            set(state => ({
                tasks: state.tasks.filter(t => t.id !== id)
            }));

            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Delete error:', error);
                set({ tasks: previous });
            }
        },

        togglePriority: async (id: string, currentPriority?: boolean) => {
            const task = get().tasks.find(t => t.id === id);
            if (!task) return;

            const nextPriority = currentPriority ?? !task.isPriority;

            set(state => ({
                tasks: state.tasks.map(t =>
                    t.id === id ? { ...t, isPriority: nextPriority } : t
                )
            }));

            const { error } = await supabase
                .from('tasks')
                .update({ is_priority: nextPriority })
                .eq('id', id);

            if (error) {
                console.error('Priority error:', error);
                set(state => ({
                    tasks: state.tasks.map(t =>
                        t.id === id ? { ...t, isPriority: !nextPriority } : t
                    )
                }));
            }
        },

        updateNotes: (content: string) => {
            set({ notes: content });
        },

        checkDailyReset: () => {
            const { lastActiveDate } = get();
            const now = new Date();

            if (!isSameDay(lastActiveDate, now)) {
                set({ lastActiveDate: now });
                get().fetchTasks();
            }
        },

        subscribeToTasks: async () => {
            if (realtimeChannel) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            realtimeChannel = supabase
                .channel('tasks_channel')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'tasks',
                        filter: `user_id=eq.${user.id}`
                    },
                    payload => {
                        console.log('Realtime payload:', payload);  // Added: Debug log for payloads
                        const { eventType, new: newRecord, old: oldRecord } = payload;
                        const todayISO = getTodayISO();

                        if (eventType === 'INSERT' && newRecord.task_date === todayISO) {
                            set(state => ({
                                tasks: state.tasks.some(t => t.id === newRecord.id)
                                    ? state.tasks
                                    : [mapRecord(newRecord), ...state.tasks]
                            }));
                        }

                        if (eventType === 'UPDATE') {
                            set(state => ({
                                tasks: state.tasks.map(t =>
                                    t.id === newRecord.id ? mapRecord(newRecord) : t
                                )
                            }));
                        }

                        if (eventType === 'DELETE') {
                            set(state => ({
                                tasks: state.tasks.filter(t => t.id !== oldRecord.id)
                            }));
                        }
                    }
                )
                .subscribe(status => {
                    console.log('Subscription status:', status);  // Added: Debug subscription success
                });
        },

        unsubscribeFromTasks: () => {
            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
                realtimeChannel = null;
            }
        }
    };
});