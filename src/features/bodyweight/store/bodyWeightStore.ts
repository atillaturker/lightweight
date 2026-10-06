/**
 * The user's body-weight log: one entry per local day. Local-first,
 * persisted per account (scoped in `userScope.ts`) and mirrored to
 * Firestore. Removing an entry keeps it as a tombstone so the removal
 * reaches other devices.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BodyWeightEntry } from '@domain/entities';
import { isoDay } from '@domain/rules';
import { zustandStorage } from '@infrastructure/storage';

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const BODY_WEIGHT_STORE_KEY = 'body-weight';

/** Entries and their actions. */
export interface BodyWeightStore {
  entries: BodyWeightEntry[];
  /** Log (or replace) the weight for the day containing `now`. */
  logWeight: (weightKg: number, now?: number) => BodyWeightEntry;
  /** Remove a day's entry; returns the tombstone, or `null` when absent. */
  removeEntry: (date: string, now?: number) => BodyWeightEntry | null;
  /** Replace the log, e.g. with the result of a cloud merge. */
  setEntries: (entries: BodyWeightEntry[]) => void;
}

/** Put `entry` in place of any entry for the same day. */
function upsert(entries: BodyWeightEntry[], entry: BodyWeightEntry): BodyWeightEntry[] {
  return [...entries.filter((existing) => existing.date !== entry.date), entry].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

/** Persisted body-weight store. */
export const useBodyWeightStore = create<BodyWeightStore>()(
  persist(
    (set, get) => ({
      entries: [],
      logWeight: (weightKg, now = Date.now()) => {
        const entry: BodyWeightEntry = { date: isoDay(now), weightKg, updatedAt: now };
        set((state) => ({ entries: upsert(state.entries, entry) }));
        return entry;
      },
      removeEntry: (date, now = Date.now()) => {
        const current = get().entries.find((entry) => entry.date === date && entry.deleted !== true);
        if (current === undefined) return null;
        const tombstone: BodyWeightEntry = { ...current, updatedAt: now, deleted: true };
        set((state) => ({ entries: upsert(state.entries, tombstone) }));
        return tombstone;
      },
      setEntries: (entries) => set({ entries }),
    }),
    {
      name: BODY_WEIGHT_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);
