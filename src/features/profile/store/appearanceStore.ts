/**
 * The color theme choice (System / Light / Dark).
 *
 * Device-level on purpose: unlike the training preferences it is NOT
 * scoped per account in `userScope.ts` and NOT synced to Firestore. The
 * theme must apply on the pre-auth screens, and a user may want dark on
 * one device and light on another.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Appearance } from '@domain/entities';
import { zustandStorage } from '@infrastructure/storage';

/** MMKV key. Device-wide: never scoped to a uid. */
export const APPEARANCE_STORE_KEY = 'appearance';

/** Appearance state and its setter. */
export interface AppearanceStore {
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
}

/** Persisted appearance choice. Defaults to following the system. */
export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set) => ({
      appearance: 'system',
      setAppearance: (appearance) => set({ appearance }),
    }),
    {
      name: APPEARANCE_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ appearance: state.appearance }),
    },
  ),
);
