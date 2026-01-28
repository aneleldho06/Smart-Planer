import { create } from 'zustand';

export type ViewType = 'today' | 'weekly' | 'monthly' | 'ai';

interface UIState {
    currentView: ViewType;
    setView: (view: ViewType) => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentView: 'today',
    setView: (view) => set({ currentView: view }),
}));
