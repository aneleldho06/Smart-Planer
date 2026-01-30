import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initialize: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: true,

    initialize: async () => {
        try {
            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();
            set({ session, user: session?.user ?? null, loading: false });

            // Listen for changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({ session, user: session?.user ?? null, loading: false });
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ loading: false });
        }
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) console.error('Error signing in with Google:', error.message);
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error.message);
        set({ user: null, session: null });
    },
}));
