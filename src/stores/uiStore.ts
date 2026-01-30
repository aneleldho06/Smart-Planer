import { create } from 'zustand';
// import { persist } from 'zustand/middleware'; // Removed as per the new implementation

export type ViewType = 'today' | 'weekly' | 'monthly' | 'ai';
export type ThemeType = 'light' | 'dark'; // This type is still defined, but the UIState's theme property is explicitly 'light' | 'dark'

interface UIState {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    theme: 'light' | 'dark'; // Explicitly 'light' | 'dark' as per the example
    toggleTheme: () => void;
    onboardingCompleted: boolean; // New state property
    completeOnboarding: () => void; // New action
}

export const useUIStore = create<UIState>((set) => ({
    currentView: 'today',
    setView: (view) => set({ currentView: view }),
    theme: (localStorage.getItem('smartplan_theme') as 'light' | 'dark') || 'light', // Initialized from localStorage, defaulting to 'light'
    toggleTheme: () =>
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('smartplan_theme', newTheme);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(newTheme);
            return { theme: newTheme };
        }),
    onboardingCompleted: localStorage.getItem('smartplan_onboarding_completed') === 'true', // Initialized from localStorage
    completeOnboarding: () => {
        localStorage.setItem('smartplan_onboarding_completed', 'true');
        set({ onboardingCompleted: true });
    },
}));
