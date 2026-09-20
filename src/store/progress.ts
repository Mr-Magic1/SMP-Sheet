import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Status = 'todo' | 'attempting' | 'solved' | 'stuck' | 'revisit';

interface LocalProgress {
  [problemId: string]: {
    status: Status;
    difficultyFelt?: number;
    usedEditorial?: boolean;
    starred?: boolean;
  };
}

interface ProgressState {
  progress: LocalProgress;
  setProgress: (problemId: string, status: Status, difficultyFelt?: number, usedEditorial?: boolean, starred?: boolean) => void;
  clearProgress: () => void;
  resetAll: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      setProgress: (problemId, status, difficultyFelt, usedEditorial, starred) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...state.progress[problemId],
              status,
              ...(difficultyFelt !== undefined && { difficultyFelt }),
              ...(usedEditorial !== undefined && { usedEditorial }),
              ...(starred !== undefined && { starred }),
            },
          },
        })),
      clearProgress: () => set({ progress: {} }),
      resetAll: () => set({ progress: {} }),
    }),
    {
      name: 'preptracker-guest-progress',
    }
  )
);
