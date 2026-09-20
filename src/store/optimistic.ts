import { create } from 'zustand';

interface OptimisticStore {
  overrides: Record<string, string>;
  setOverride: (problemId: string, status: string) => void;
  clearOverrides: () => void;
}

export const useOptimisticProgressStore = create<OptimisticStore>((set) => ({
  overrides: {},
  setOverride: (problemId, status) => 
    set((state) => ({ overrides: { ...state.overrides, [problemId]: status } })),
  clearOverrides: () => set({ overrides: {} }),
}));
