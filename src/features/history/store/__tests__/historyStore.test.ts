/**
 * Tests for the durable local history store.
 *
 * These pin the contract the recorder and the History screen depend on:
 * newest-first order, the retention cap, targeted removal, and a persisted
 * payload that carries only the sessions array.
 */

// In-memory MMKV double, matching the pattern used across the suite.
const mockMemory = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => {
      mockMemory.set(key, value);
    },
    remove: (key: string) => {
      mockMemory.delete(key);
    },
  }),
}));

import type { Workout } from '@domain/entities';

import { MAX_HISTORY_SESSIONS, useHistoryStore } from '../historyStore';

/** Build a minimal finished workout. */
function makeWorkout(id: string, startedAt: number): Workout {
  return {
    id,
    routineId: null,
    routineName: `Routine ${id}`,
    startedAt,
    finishedAt: startedAt + 60_000,
    sets: [],
  };
}

/** Read and parse the persisted `history` payload, or `null`. */
function persisted(): { state: Record<string, unknown> } | null {
  const raw = mockMemory.get('history');
  if (!raw) return null;
  return JSON.parse(raw) as { state: Record<string, unknown> };
}

beforeEach(() => {
  mockMemory.clear();
  useHistoryStore.setState({ sessions: [] });
});

describe('addSession', () => {
  it('prepends the newest session', () => {
    useHistoryStore.getState().addSession(makeWorkout('a', 1));
    useHistoryStore.getState().addSession(makeWorkout('b', 2));

    expect(useHistoryStore.getState().sessions.map((s) => s.id)).toEqual([
      'b',
      'a',
    ]);
  });

  it('caps the list and drops the oldest session', () => {
    const existing = Array.from({ length: MAX_HISTORY_SESSIONS }, (_, index) =>
      makeWorkout(`old-${index}`, index),
    );
    useHistoryStore.setState({ sessions: existing });

    useHistoryStore.getState().addSession(makeWorkout('new', 1_000_000));

    const sessions = useHistoryStore.getState().sessions;
    expect(sessions).toHaveLength(MAX_HISTORY_SESSIONS);
    expect(sessions[0].id).toBe('new');
    expect(sessions.some((s) => s.id === `old-${MAX_HISTORY_SESSIONS - 1}`)).toBe(
      false,
    );
  });
});

describe('removeSession', () => {
  it('removes the correct entry', () => {
    useHistoryStore.getState().addSession(makeWorkout('a', 1));
    useHistoryStore.getState().addSession(makeWorkout('b', 2));

    useHistoryStore.getState().removeSession('a');

    expect(useHistoryStore.getState().sessions.map((s) => s.id)).toEqual(['b']);
  });

  it('is a no-op for an unknown id', () => {
    useHistoryStore.getState().addSession(makeWorkout('a', 1));

    useHistoryStore.getState().removeSession('missing');

    expect(useHistoryStore.getState().sessions).toHaveLength(1);
  });
});

describe('clearAll', () => {
  it('empties the list', () => {
    useHistoryStore.getState().addSession(makeWorkout('a', 1));
    useHistoryStore.getState().addSession(makeWorkout('b', 2));

    useHistoryStore.getState().clearAll();

    expect(useHistoryStore.getState().sessions).toEqual([]);
  });
});

describe('persist', () => {
  it('writes only the sessions array', () => {
    useHistoryStore.getState().addSession(makeWorkout('a', 1));

    expect(Object.keys(persisted()?.state ?? {})).toEqual(['sessions']);
  });
});
