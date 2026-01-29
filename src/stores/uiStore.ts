import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType = 'today' | 'weekly' | 'monthly' | 'ai';
export type ThemeType = 'light' | 'dark';

interface UIState {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    theme: ThemeType;
    toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            currentView: 'today',
            setView: (view) => set({ currentView: view }),
            theme: 'light',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
        }),
        {
            name: 'ui-storage',
        }
    )
);
