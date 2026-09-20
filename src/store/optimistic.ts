import { create } from 'zustand';

interface OptimisticStore {
  overrides: Record<string, string>;
  starredOverrides: Record<string, boolean>;
  setOverride: (problemId: string, status: string) => void;
  setStarredOverride: (problemId: string, starred: boolean) => void;
  clearOverrides: () => void;
}

export const useOptimisticProgressStore = create<OptimisticStore>((set) => ({
  overrides: {},
  starredOverrides: {},
  setOverride: (problemId, status) => 
    set((state) => ({ overrides: { ...state.overrides, [problemId]: status } })),
  setStarredOverride: (problemId, starred) =>
    set((state) => ({ starredOverrides: { ...state.starredOverrides, [problemId]: starred } })),
  clearOverrides: () => set({ overrides: {}, starredOverrides: {} }),
}));
