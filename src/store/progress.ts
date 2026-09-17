import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Status = 'todo' | 'attempting' | 'solved' | 'stuck' | 'revisit';

interface LocalProgress {
  [problemId: string]: {
    status: Status;
    difficultyFelt?: number;
    usedEditorial?: boolean;
  };
}

interface ProgressState {
  progress: LocalProgress;
  setProgress: (problemId: string, status: Status, difficultyFelt?: number, usedEditorial?: boolean) => void;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      setProgress: (problemId, status, difficultyFelt, usedEditorial) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...state.progress[problemId],
              status,
              ...(difficultyFelt !== undefined && { difficultyFelt }),
              ...(usedEditorial !== undefined && { usedEditorial }),
            },
          },
        })),
      clearProgress: () => set({ progress: {} }),
    }),
    {
      name: 'sheetforge-guest-progress',
    }
  )
);
