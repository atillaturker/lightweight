/**
 * The exercise-history seam used to be left unregistered, so "Last time"
 * never showed and sets never seeded from history. These pin that it is
 * wired, and in the order its consumers expect.
 */
const mockMemory = new Map<string, string>();
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => mockMemory.set(key, value),
    remove: (key: string) => mockMemory.delete(key),
  }),
}));

import type { Workout } from '@domain/entities';
import { useHistoryStore } from '@features/history/store';
import { getExerciseHistory, resetSessionDataProviders } from '@features/workout/services';

import { registerDataProviders } from '../registerDataProviders';

function session(id: string, startedAt: number, weightKg: number): Workout {
  return {
    id,
    routineId: null,
    routineName: 'Push',
    startedAt,
    finishedAt: startedAt + 1,
    sets: [
      { id: `${id}-b`, exerciseId: 'bench-press', workoutId: id, weightKg, reps: 8, type: 'normal', completed: true, completedAt: startedAt, order: 0 },
      { id: `${id}-r`, exerciseId: 'barbell-row', workoutId: id, weightKg: 50, reps: 8, type: 'normal', completed: true, completedAt: startedAt, order: 0 },
    ],
  };
}

afterEach(() => resetSessionDataProviders());

describe('exercise history provider', () => {
  it('returns one exercise’s sets, oldest session first', () => {
    // The history store keeps sessions newest first.
    useHistoryStore.setState({ sessions: [session('new', 2, 82.5), session('old', 1, 80)] });
    registerDataProviders();

    expect(getExerciseHistory('bench-press').map((set) => set.weightKg)).toEqual([80, 82.5]);
  });
});
