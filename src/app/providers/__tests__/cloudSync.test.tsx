/**
 * Sign-in write-path tests.
 *
 * The regression these pin: signing in with an account that has no profile
 * document used to do nothing in the sign-in handler (the document was only
 * created by a delayed, silent preference push). A missing profile must now
 * be created immediately.
 */
const mockFetchUserProfile = jest.fn();
const mockCreateUserProfile = jest.fn();
const mockSaveUserPreferences = jest.fn();
const mockSaveHasOnboarded = jest.fn();
const mockFetchWorkouts = jest.fn();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: () => undefined,
    set: () => undefined,
    remove: () => undefined,
  }),
}));

jest.mock('@features/profile/services/firestoreProfile', () => ({
  fetchUserProfile: (...args: unknown[]) => mockFetchUserProfile(...args),
  createUserProfile: (...args: unknown[]) => mockCreateUserProfile(...args),
  saveUserPreferences: (...args: unknown[]) => mockSaveUserPreferences(...args),
  saveHasOnboarded: (...args: unknown[]) => mockSaveHasOnboarded(...args),
}));

jest.mock('@features/history/services/firestoreWorkouts', () => ({
  fetchWorkoutsFromFirestore: (...args: unknown[]) => mockFetchWorkouts(...args),
  saveWorkoutToFirestore: jest.fn(),
  deleteWorkoutFromFirestore: jest.fn(),
}));

import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useAuthStore } from '@features/auth/store';
import type { Workout } from '@domain/entities';
import { useHistoryStore } from '@features/history/store';
import { useOfflineQueue } from '@infrastructure/network';

import { CloudSync } from '../useCloudSync';

/** A finished workout with only identity fields populated. */
function makeWorkout(id: string, startedAt: number): Workout {
  return { id, routineId: null, routineName: id, startedAt, finishedAt: startedAt + 1, sets: [] };
}

/** A complete cloud read. */
function remoteOf(workouts: Workout[], deletedIds: string[] = []) {
  return { workouts, deletedIds, truncatedBefore: null };
}

/** Workout ids queued for upload. */
function queuedSaveIds(): string[] {
  return useOfflineQueue
    .getState()
    .queue.flatMap((item) => {
      const body = item.body as { kind?: string; workout?: Workout };
      return body.kind === 'saveWorkout' && body.workout ? [body.workout.id] : [];
    });
}

const USER = {
  uid: 'uid-1',
  email: 'a@b.com',
  displayName: 'A',
  photoURL: null,
  provider: 'password' as const,
  hasOnboarded: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchUserProfile.mockResolvedValue(null);
  mockCreateUserProfile.mockResolvedValue(undefined);
  mockSaveUserPreferences.mockResolvedValue(undefined);
  mockSaveHasOnboarded.mockResolvedValue(undefined);
  mockFetchWorkouts.mockResolvedValue(remoteOf([]));
  useHistoryStore.setState({ sessions: [] });
  useOfflineQueue.setState({ queue: [] });
  useAuthStore.setState({
    bootstrapped: true,
    user: USER,
    onboardedUids: [],
  });
});

describe('useCloudSync sign-in', () => {
  it('creates the profile document when the cloud has none', async () => {
    render(<CloudSync />);

    await waitFor(() =>
      expect(mockCreateUserProfile).toHaveBeenCalledWith(
        'uid-1',
        expect.objectContaining({ hasOnboarded: false }),
      ),
    );
  });

  it('does not create a document when the profile already exists', async () => {
    mockFetchUserProfile.mockResolvedValue({
      hasOnboarded: false,
      preferences: {
        unit: 'kg',
        weekStart: 'monday',
        rpeEnabled: false,
        restTimerSeconds: 90,
        notificationsEnabled: true,
      },
    });

    render(<CloudSync />);

    await waitFor(() => expect(mockFetchUserProfile).toHaveBeenCalledWith('uid-1'));
    expect(mockCreateUserProfile).not.toHaveBeenCalled();
  });

  it('warns instead of swallowing a failed profile write', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockCreateUserProfile.mockRejectedValue(new Error('permission-denied'));

    render(<CloudSync />);

    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        '[firestore] failed to create user profile',
        expect.any(Error),
      ),
    );
    warn.mockRestore();
  });

  it('does not merge a read that resolves after the account changed', async () => {
    let resolveWorkouts: (remote: unknown) => void = () => undefined;
    mockFetchWorkouts.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveWorkouts = resolve;
      }),
    );
    useHistoryStore.setState({ sessions: [] });

    render(<CloudSync />);
    await waitFor(() => expect(mockFetchWorkouts).toHaveBeenCalledWith('uid-1'));

    useAuthStore.setState({ user: { ...USER, uid: 'uid-2' } });
    await act(async () => {
      resolveWorkouts(remoteOf([makeWorkout('w-1', 1)]));
    });

    expect(useHistoryStore.getState().sessions).toEqual([]);
  });

});

describe('useCloudSync history reconciliation', () => {
  it('removes a local session deleted on another device', async () => {
    useHistoryStore.setState({ sessions: [makeWorkout('gone', 5)] });
    mockFetchWorkouts.mockResolvedValue(remoteOf([], ['gone']));

    render(<CloudSync />);

    await waitFor(() => expect(useHistoryStore.getState().sessions).toEqual([]));
  });

  it('queues a session the cloud has never seen for upload', async () => {
    useHistoryStore.setState({ sessions: [makeWorkout('local-only', 5)] });

    render(<CloudSync />);

    await waitFor(() => expect(queuedSaveIds()).toEqual(['local-only']));
  });

  it('does not queue a session that is already waiting to upload', async () => {
    const workout = makeWorkout('pending', 5);
    useHistoryStore.setState({ sessions: [workout] });
    useOfflineQueue.getState().enqueue({
      endpoint: 'firestore/users/uid-1/workouts/pending',
      method: 'PUT',
      transport: 'firestore',
      scope: 'uid-1',
      body: { kind: 'saveWorkout', uid: 'uid-1', workout },
    });

    render(<CloudSync />);

    await waitFor(() => expect(mockFetchWorkouts).toHaveBeenCalled());
    await waitFor(() => expect(useHistoryStore.getState().sessions).toHaveLength(1));
    expect(queuedSaveIds()).toEqual(['pending']);
  });

  it('does not restore a session whose delete is still queued', async () => {
    useOfflineQueue.getState().enqueue({
      endpoint: 'firestore/users/uid-1/workouts/deleted-offline',
      method: 'DELETE',
      transport: 'firestore',
      scope: 'uid-1',
      body: { kind: 'deleteWorkout', uid: 'uid-1', workoutId: 'deleted-offline', startedAt: 5 },
    });
    mockFetchWorkouts.mockResolvedValue(
      remoteOf([makeWorkout('deleted-offline', 5), makeWorkout('kept', 6)]),
    );

    render(<CloudSync />);

    await waitFor(() =>
      expect(useHistoryStore.getState().sessions.map((s) => s.id)).toEqual(['kept']),
    );
  });

  it('uploads nothing when the cloud read fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    useHistoryStore.setState({ sessions: [makeWorkout('local-only', 5)] });
    mockFetchWorkouts.mockRejectedValue(new Error('unavailable'));

    render(<CloudSync />);

    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith('[firestore] failed to read workouts', expect.any(Error)),
    );
    expect(queuedSaveIds()).toEqual([]);
    expect(useHistoryStore.getState().sessions).toHaveLength(1);
    warn.mockRestore();
  });
});

