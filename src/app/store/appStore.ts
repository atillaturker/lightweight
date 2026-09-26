/**
 * App-level flags.
 *
 * These describe the install itself, not the signed-in account, so they
 * are deliberately kept out of the auth store. Both `hasSeenWelcome` and
 * `hasSeenIntro` are persisted to MMKV and are never cleared on sign-out,
 * so the pre-auth screens are shown at most once per install.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@infrastructure/storage';

/** App store state plus the mutators used by screens. */
export interface AppStore {
  /** Whether the welcome screen has been dismissed once. */
  hasSeenWelcome: boolean;
  /** Whether the pre-auth intro group has been completed or skipped. */
  hasSeenIntro: boolean;
  /** Mark the welcome screen as seen. Persisted, never cleared. */
  markWelcomeSeen: () => void;
  /** Mark the intro group as seen. Persisted, never cleared on sign-out. */
  markIntroSeen: () => void;
}

/** Initial state — nothing of the first run has been seen yet. */
const INITIAL_STATE: Pick<AppStore, 'hasSeenWelcome' | 'hasSeenIntro'> = {
  hasSeenWelcome: false,
  hasSeenIntro: false,
};

/**
 * Persisted app store. Subscribe with a selector, e.g.
 * `useAppStore((s) => s.hasSeenWelcome)`.
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),
      markIntroSeen: () => set({ hasSeenIntro: true }),
    }),
    {
      name: 'app',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        hasSeenIntro: state.hasSeenIntro,
      }),
    },
  ),
);
