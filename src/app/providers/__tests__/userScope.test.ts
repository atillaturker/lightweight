/**
 * Account isolation tests.
 *
 * The regression these pin: user-owned stores used fixed MMKV keys, so after
 * one account signed out and another signed in on the same device, the new
 * account saw — and could sync — the previous account's history, routines
 * and unfinished workout.
 */
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
import { useAuthStore } from '@features/auth/store';
import type { AuthUser } from '@features/auth/types';
import { useHistoryStore } from '@features/history/store';
import { usePreferencesStore } from '@features/profile/store';
import { useRoutineStore } from '@features/routines/store';
import { useActiveWorkoutStore, useLastSessionStore } from '@features/workout/store';

import { registerUserScope } from '../userScope';

/** Build a signed-in user for `uid`. */
function makeUser(uid: string): AuthUser {
  return {
    uid,
    email: `${uid}@example.com`,
    displayName: uid,
    photoURL: null,
    provider: 'password',
    hasOnboarded: true,
  };
}

/** A minimal finished workout. */
function makeWorkout(id: string): Workout {
  return {
    id,
    routineId: null,
    routineName: 'Push',
    startedAt: 1_700_000_000_000,
    finishedAt: 1_700_000_360_000,
    sets: [],
  };
}

let stop: () => void = () => undefined;

beforeEach(() => {
  mockMemory.clear();
  useAuthStore.setState({ user: null, bootstrapped: true, onboardedUids: [] });
  stop = registerUserScope();
});

afterEach(() => {
  stop();
});

describe('registerUserScope', () => {
  it('hides the previous account data after a sign-out', () => {
    useAuthStore.getState().setUser(makeUser('uid-a'));
    useHistoryStore.getState().addSession(makeWorkout('w-a'));

    useAuthStore.getState().reset();

    expect(useHistoryStore.getState().sessions).toEqual([]);
  });

  it('gives a second account an empty history, routines and workout', () => {
    useAuthStore.getState().setUser(makeUser('uid-a'));
    useHistoryStore.getState().addSession(makeWorkout('w-a'));
    useRoutineStore.getState().seedFromTemplate('full-body');
    usePreferencesStore.getState().setUnit('lb');

    useAuthStore.getState().reset();
    useAuthStore.getState().setUser(makeUser('uid-b'));

    expect(useHistoryStore.getState().sessions).toEqual([]);
    expect(useRoutineStore.getState().routines).toEqual([]);
    expect(useActiveWorkoutStore.getState().sessionId).toBeNull();
    expect(usePreferencesStore.getState().unit).toBe('kg');
  });

  it('restores the first account data when it signs back in', () => {
    useAuthStore.getState().setUser(makeUser('uid-a'));
    useHistoryStore.getState().addSession(makeWorkout('w-a'));
    useRoutineStore.getState().seedFromTemplate('full-body');

    useAuthStore.getState().reset();
    useAuthStore.getState().setUser(makeUser('uid-b'));
    useHistoryStore.getState().addSession(makeWorkout('w-b'));
    useAuthStore.getState().reset();
    useAuthStore.getState().setUser(makeUser('uid-a'));

    expect(useHistoryStore.getState().sessions.map((s) => s.id)).toEqual(['w-a']);
    expect(useRoutineStore.getState().routines).toHaveLength(1);
  });

  it('drops the in-memory summary hand-off on account change', () => {
    useAuthStore.getState().setUser(makeUser('uid-a'));
    useLastSessionStore.getState().setLastSession(makeWorkout('w-a'));

    useAuthStore.getState().reset();

    expect(useLastSessionStore.getState().lastSession).toBeNull();
  });
});
