import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isSameDay, startOfDay, endOfDay } from 'date-fns';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: number;
    scheduledTime?: string;
    isPriority?: boolean;
    userId?: string;
}

interface TaskState {
    tasks: Task[];
    loading: boolean;
    lastActiveDate: number;
    fetchTasks: () => Promise<void>;
    addTask: (title: string, scheduledTime?: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    togglePriority: (id: string) => Promise<void>;
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
        createdAt: r.created_at,
        scheduledTime: r.scheduled_time,
        isPriority: r.is_priority,
        userId: r.user_id
    });

    return {
        tasks: [],
        loading: false,
        lastActiveDate: Date.now(),
        notes: '',

        fetchTasks: async () => {
            set({ loading: true });
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ tasks: [], loading: false });
                return;
            }

            // Filter for today's tasks
            const todayStart = startOfDay(new Date()).getTime();
            const todayEnd = endOfDay(new Date()).getTime();

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', todayStart)
                .lte('created_at', todayEnd)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error);
                set({ loading: false });
                return;
            }

            set({ tasks: data ? data.map(mapRecord) : [], loading: false });
        },

        addTask: async (title: string, scheduledTime?: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newTaskDB = {
                user_id: user.id,
                title,
                completed: false,
                created_at: Date.now(),
                scheduled_time: scheduledTime,
                is_priority: false
            };

            const { data, error } = await supabase.from('tasks').insert(newTaskDB).select();

            if (error) {
                console.error('Error adding task:', error);
                return;
            }

            // Manually update state to ensure UI responsiveness, handling potential race condition with Realtime
            if (data) {
                const newLocalTask = mapRecord(data[0]);
                set((state) => {
                    // Prevent duplicate if Realtime already added it (unlikely this fast, but good safety)
                    if (state.tasks.some(t => t.id === newLocalTask.id)) return state;
                    return { tasks: [newLocalTask, ...state.tasks] };
                });
            }
        },

        toggleTask: async (id: string) => {
            // Find current status from local state to toggle
            const task = get().tasks.find(t => t.id === id);
            if (!task) return;

            const { error } = await supabase
                .from('tasks')
                .update({ completed: !task.completed })
                .eq('id', id);

            if (error) console.error('Error toggling task:', error);
        },

        deleteTask: async (id: string) => {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) console.error('Error deleting task:', error);
        },

        togglePriority: async (id: string) => {
            const task = get().tasks.find(t => t.id === id);
            if (!task) return;

            const { error } = await supabase
                .from('tasks')
                .update({ is_priority: !task.isPriority })
                .eq('id', id);

            if (error) console.error('Error toggling priority:', error);
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

            realtimeChannel = supabase
                .channel('tasks_channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;
                    const todayStart = startOfDay(new Date()).getTime();
                    const todayEnd = endOfDay(new Date()).getTime();

                    // Check if a record belongs to "Today" (based on created_at)
                    const isToday = (record: any) => {
                        return record.created_at >= todayStart && record.created_at <= todayEnd;
                    };

                    set((state) => {
                        if (eventType === 'INSERT') {
                            if (isToday(newRecord)) {
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
                                // If updated task is no longer today (unlikely) or just needs update
                                return {
                                    tasks: state.tasks.map((t) =>
                                        t.id === newRecord.id ? mapRecord(newRecord) : t
                                    )
                                };
                            }
                        }
                        return state;
                    });
                })
                .subscribe();
        },

        unsubscribeFromTasks: () => {
            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
                realtimeChannel = null;
            }
        },
    };
});
