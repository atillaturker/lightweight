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

import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useAuthStore } from '@features/auth/store';

import { CloudSync } from '../useCloudSync';

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
  mockFetchWorkouts.mockResolvedValue([]);
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
});
