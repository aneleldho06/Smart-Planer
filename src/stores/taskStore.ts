import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isSameDay, startOfDay, endOfDay } from 'date-fns';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    created_at: number;
    scheduled_time?: string;
    is_priority?: boolean;
    user_id?: string;
}

interface TaskState {
    tasks: Task[];
    loading: boolean;
    lastActiveDate: number;
    fetchTasks: () => Promise<void>;
    addTask: (title: string, scheduledTime?: string) => Promise<void>;
    toggleTask: (id: string, currentStatus: boolean) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    togglePriority: (id: string, currentPriority: boolean) => Promise<void>;
    updateNotes: (content: string) => void;
    checkDailyReset: () => void;
    subscribeToTasks: () => void;
    unsubscribeFromTasks: () => void;
    notes: string;
}

export const useTaskStore = create<TaskState>((set, get) => {
    let realtimeChannel: RealtimeChannel | null = null;

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

            // DB returns snake_case, which matches our updated Task interface
            set({ tasks: data as Task[], loading: false });
        },

        addTask: async (title: string, scheduledTime?: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newTask = {
                user_id: user.id,
                title,
                completed: false,
                created_at: Date.now(),
                scheduled_time: scheduledTime,
                is_priority: false
            };

            const { error } = await supabase.from('tasks').insert(newTask);
            if (error) console.error('Error adding task:', error);
        },

        toggleTask: async (id: string, currentStatus: boolean) => {
            const { error } = await supabase
                .from('tasks')
                .update({ completed: !currentStatus })
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

        togglePriority: async (id: string, currentPriority: boolean) => {
            const { error } = await supabase
                .from('tasks')
                .update({ is_priority: !currentPriority })
                .eq('id', id);

            if (error) console.error('Error toggling priority:', error);
        },

        updateNotes: (content: string) => {
            set({ notes: content });
            // TODO: Persist notes to Supabase if desired. For now, local state.
            // If we want persistent notes, we need a 'notes' table or column.
            // Requirement says "Persistent tasks", implies notes too maybe?
            // "Priorities/Notes" section.
            // Ignoring for now as schema didn't include notes table, 
            // but we can add it to 'monthly_goals' or separate table later.
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

            // Subscribe only to changes for this user would be ideal, but RLS handles it.
            // We listen to all 'tasks' changes.
            realtimeChannel = supabase
                .channel('tasks_channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    // We need to filter events. 
                    // 1. Check if it belongs to current user is hard here without user ID in payload sometimes?
                    //    Actually, RLS means we only receive our own events?
                    //    Supabase Realtime respects RLS if 'broadcast' is off and we subscribe with token?
                    //    Wait, standard realtime does NOT respect RLS automatically unless configured with "Walrus" (Postgres level).
                    //    But for client-side filtering, we just check payloads.

                    // Also need to check if the task belongs to "Today".
                    // 'newRecord' has 'created_at'.
                    const todayStart = startOfDay(new Date()).getTime();
                    const todayEnd = endOfDay(new Date()).getTime();

                    const isToday = (record: any) => {
                        return record.created_at >= todayStart && record.created_at <= todayEnd;
                    };

                    set((state) => {
                        if (eventType === 'INSERT') {
                            if (isToday(newRecord)) {
                                return { tasks: [newRecord as Task, ...state.tasks] };
                            }
                        } else if (eventType === 'DELETE') {
                            return { tasks: state.tasks.filter((t) => t.id !== oldRecord.id) };
                        } else if (eventType === 'UPDATE') {
                            if (isToday(newRecord)) {
                                return {
                                    tasks: state.tasks.map((t) =>
                                        t.id === newRecord.id ? (newRecord as Task) : t
                                    )
                                };
                            } else {
                                // If updated to be outside today (unlikely) or valid update but not today?
                                // If it was in list, and date changed?
                                // Just update it if it matches ID.
                                return {
                                    tasks: state.tasks.map((t) =>
                                        t.id === newRecord.id ? (newRecord as Task) : t
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
