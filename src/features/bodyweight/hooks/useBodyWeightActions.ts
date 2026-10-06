/**
 * Log or remove body weight locally first, then mirror to the cloud seam
 * (which writes or queues). Never blocks on the network.
 */
import { useCallback } from 'react';

import type { BodyWeightEntry } from '@domain/entities';
import { mergeBodyWeight } from '@domain/rules';

import { syncBodyWeightToCloud } from '../services';
import { useBodyWeightStore } from '../store';

/** Actions returned by {@link useBodyWeightActions}. */
export interface BodyWeightActions {
  /** Log today's weight, replacing any entry for today. */
  logWeight: (weightKg: number) => void;
  /** Remove one day's entry. */
  removeEntry: (date: string) => void;
  /**
   * Merge entries from a backup, the newer edit winning per day, and
   * mirror the changed days to the cloud. Returns how many days changed.
   */
  importEntries: (entries: BodyWeightEntry[]) => number;
}

/** Body-weight writes, mirrored to the cloud. */
export function useBodyWeightActions(): BodyWeightActions {
  const log = useBodyWeightStore((state) => state.logWeight);
  const remove = useBodyWeightStore((state) => state.removeEntry);
  const logWeight = useCallback((weightKg: number) => syncBodyWeightToCloud(log(weightKg)), [log]);
  const removeEntry = useCallback(
    (date: string) => {
      const tombstone = remove(date);
      if (tombstone !== null) syncBodyWeightToCloud(tombstone);
    },
    [remove],
  );
  const importEntries = useCallback((entries: BodyWeightEntry[]): number => {
    const store = useBodyWeightStore.getState();
    const merge = mergeBodyWeight(entries, store.entries);
    if (merge.toUpload.length === 0) return 0;
    store.setEntries(merge.entries);
    merge.toUpload.forEach(syncBodyWeightToCloud);
    return merge.toUpload.length;
  }, []);
  return { logWeight, removeEntry, importEntries };
}
