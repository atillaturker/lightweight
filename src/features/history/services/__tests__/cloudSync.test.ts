jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: () => undefined,
    set: () => undefined,
    remove: () => undefined,
  }),
}));

import type { Workout } from '@domain/entities';
import { useOfflineQueue } from '@infrastructure/network';

import { enqueueWorkoutDelete, enqueueWorkoutSave } from '../cloudSync';

const WORKOUT: Workout = {
  id: 'w-1',
  routineId: null,
  routineName: 'Push',
  startedAt: 1,
  finishedAt: 2,
  sets: [],
};

beforeEach(() => {
  useOfflineQueue.setState({ queue: [] });
});

describe('enqueueWorkoutSave', () => {
  it('scopes the queued save to the owning uid', () => {
    enqueueWorkoutSave('uid-a', WORKOUT);

    expect(useOfflineQueue.getState().queue[0].scope).toBe('uid-a');
  });
});

describe('enqueueWorkoutDelete', () => {
  it('scopes the queued delete to the owning uid', () => {
    enqueueWorkoutDelete('uid-a', 'w-1');

    expect(useOfflineQueue.getState().queue[0].scope).toBe('uid-a');
  });
});
