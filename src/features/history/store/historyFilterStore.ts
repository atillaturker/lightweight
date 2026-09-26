/**
 * History list filter.
 *
 * Kept in a tiny Zustand store rather than local screen state so another
 * screen can pre-select it before navigating — Progress's PR strip opens
 * History already showing only sessions with a record. Transient by design:
 * a cold start resets to "all", and the store is not persisted.
 */
import { create } from 'zustand';

/** Which sessions the History list shows. */
export type HistoryFilter = 'all' | 'pr';

/** Filter state plus the setter the chips and Progress call. */
export interface HistoryFilterStore {
  /** Active filter. Defaults to every session. */
  filter: HistoryFilter;
  /** Set the active filter. */
  setFilter: (filter: HistoryFilter) => void;
  /** Return the filter to its default. */
  resetFilter: () => void;
}

/**
 * History filter store. Subscribe with a selector, e.g.
 * `useHistoryFilterStore((s) => s.filter)`.
 */
export const useHistoryFilterStore = create<HistoryFilterStore>()((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
  resetFilter: () => set({ filter: 'all' }),
}));
