/**
 * User training preferences.
 *
 * Local-first: the preferences are held in Zustand and persisted to MMKV
 * under the `preferences` key. The shape is the domain `UserPreferences`
 * type — the store adds only setters, so no preference is redefined here.
 *
 * Other features never subscribe to this store directly. The workout
 * feature reads the rest duration through the provider seam in
 * `app/providers/registerDataProviders`.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  UserPreferences,
  WeekStart,
  WeightUnit,
} from '@domain/entities';
import { zustandStorage } from '@infrastructure/storage';

/**
 * Defaults for a fresh install. `restTimerSeconds` mirrors the workout
 * feature's fallback so the first set feels the same before any change.
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  unit: 'kg',
  weekStart: 'monday',
  rpeEnabled: false,
  restTimerSeconds: 90,
  notificationsEnabled: true,
};

/** Preference state plus the setters each settings row/toggle calls. */
export interface PreferencesStore extends UserPreferences {
  /** Set the display unit for weights. */
  setUnit: (unit: WeightUnit) => void;
  /** Set which day starts an analytics week. */
  setWeekStart: (weekStart: WeekStart) => void;
  /** Toggle the per-set RPE field. */
  setRpeEnabled: (enabled: boolean) => void;
  /** Set the rest period, in seconds, used after a completed set. */
  setRestTimerSeconds: (seconds: number) => void;
  /** Toggle notifications. */
  setNotificationsEnabled: (enabled: boolean) => void;
}

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const PREFERENCES_STORE_KEY = 'preferences';

/**
 * Persisted preferences store. Subscribe with a selector, e.g.
 * `usePreferencesStore((s) => s.unit)`.
 */
export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setUnit: (unit) => set({ unit }),
      setWeekStart: (weekStart) => set({ weekStart }),
      setRpeEnabled: (rpeEnabled) => set({ rpeEnabled }),
      setRestTimerSeconds: (restTimerSeconds) => set({ restTimerSeconds }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
    }),
    {
      name: PREFERENCES_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        unit: state.unit,
        weekStart: state.weekStart,
        rpeEnabled: state.rpeEnabled,
        restTimerSeconds: state.restTimerSeconds,
        notificationsEnabled: state.notificationsEnabled,
      }),
    },
  ),
);
