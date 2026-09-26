/**
 * The most recently finished session.
 *
 * The summary screen is pushed after the store has already been cleared,
 * so the finished `Workout` needs somewhere to live for one navigation.
 * It is deliberately NOT persisted: it is a hand-off between two screens,
 * and a cold start has nothing to summarize.
 */
import { create } from 'zustand';

import type { Workout } from '@domain/entities';

/** State and mutators for the session hand-off. */
export interface LastSessionState {
  /** The workout just finished, or `null` when there is nothing to show. */
  lastSession: Workout | null;
  /** Record the session the summary screen should render. */
  setLastSession: (workout: Workout) => void;
  /** Drop the hand-off. */
  clearLastSession: () => void;
}

/**
 * Non-persisted hand-off store. Subscribe with a selector, e.g.
 * `useLastSessionStore((s) => s.lastSession)`.
 */
export const useLastSessionStore = create<LastSessionState>()((set) => ({
  lastSession: null,
  setLastSession: (workout) => set({ lastSession: workout }),
  clearLastSession: () => set({ lastSession: null }),
}));
