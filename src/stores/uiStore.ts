import { create } from 'zustand';

export type ViewType = 'today' | 'weekly' | 'monthly' | 'ai' | 'projects' | 'project-detail';

interface UIState {
    currentView: ViewType;
    setView: (view: ViewType) => void;

    theme: 'light' | 'dark';
    toggleTheme: () => void;

    onboardingCompleted: boolean;
    completeOnboarding: () => void;

    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentView: 'today',
    setView: (view) => set({ currentView: view }),

    theme: (localStorage.getItem('smartplan_theme') as 'light' | 'dark') || 'light',
    toggleTheme: () =>
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('smartplan_theme', newTheme);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(newTheme);
            return { theme: newTheme };
        }),

    onboardingCompleted: localStorage.getItem('smartplan_onboarding_completed') === 'true',
    completeOnboarding: () => {
        localStorage.setItem('smartplan_onboarding_completed', 'true');
        set({ onboardingCompleted: true });
    },

    selectedProjectId: null,
    setSelectedProjectId: (id) => set({ selectedProjectId: id }),
}));
