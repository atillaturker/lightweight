/**
 * Behavior tests for the Exercise Detail hero unit.
 *
 * The read model is covered by the exerciseDetail unit tests; this suite
 * pins that the hero renders in the user's preferred unit (kg vs lb) via the
 * workout feature's unit seam. Navigation is mocked; not tested visually.
 */
import { render, screen } from '@testing-library/react-native';
import React from 'react';

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

jest.mock('@react-native-community/netinfo', () => ({
  fetch: async () => ({ isConnected: true }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Workout } from '@domain/entities';
import { registerDataProviders } from '@/app/providers';
import { useHistoryStore } from '@features/history/store';
import { usePreferencesStore } from '@features/profile/store';
import { resetSessionDataProviders } from '@features/workout';

import type { ProgressStackParamList } from '@/app/navigation/types';

import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';

type Props = NativeStackScreenProps<ProgressStackParamList, 'ExerciseDetail'>;

/** Navigation double; the screen only reads `goBack`. */
const navigation = { goBack: jest.fn() } as unknown as Props['navigation'];

/** Route double pointing at a real library exercise. */
const route = { params: { exerciseId: 'bench-press' } } as Props['route'];

/** A recent session with one bench-press working set. */
function recentSession(): Workout {
  const startedAt = Date.now() - 60_000;
  return {
    id: 'session-1',
    routineId: 'routine-1',
    routineName: 'Push',
    startedAt,
    finishedAt: startedAt + 30 * 60_000,
    sets: [
      {
        id: 'set-1',
        exerciseId: 'bench-press',
        workoutId: 'session-1',
        weightKg: 100,
        reps: 5,
        type: 'normal',
        completed: true,
        completedAt: startedAt,
        order: 0,
      },
    ],
  };
}

beforeEach(() => {
  mockMemory.clear();
  navigation.goBack = jest.fn();
  useHistoryStore.setState({ sessions: [recentSession()] });
  registerDataProviders();
});

afterEach(() => {
  resetSessionDataProviders();
});

describe('ExerciseDetailScreen hero unit', () => {
  it('renders the hero in kilograms by default', () => {
    usePreferencesStore.setState({ unit: 'kg' });

    render(<ExerciseDetailScreen navigation={navigation} route={route} />);

    expect(screen.getByText('kg')).toBeTruthy();
    expect(screen.getByText('116.7')).toBeTruthy();
  });

  it('renders the hero in pounds when the preference is lb', () => {
    usePreferencesStore.setState({ unit: 'lb' });

    render(<ExerciseDetailScreen navigation={navigation} route={route} />);

    expect(screen.getByText('lb')).toBeTruthy();
    expect(screen.getByText('257.2')).toBeTruthy();
  });
});
