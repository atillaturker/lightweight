/**
 * Behavior tests for the Progress screen metric selector.
 *
 * The read model is covered by the progressData unit tests; this suite pins
 * that switching the metric tab swaps the hero label and unit. Navigation is
 * mocked and the screen is not tested visually.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
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
import {
  useHistoryFilterStore,
  useHistoryStore,
} from '@features/history/store';

import type { ProgressStackParamList } from '@/app/navigation/types';

import { ProgressScreen } from '../screens/ProgressScreen';

type Props = NativeStackScreenProps<ProgressStackParamList, 'Progress'>;

/** Navigation double; the screen only reads `navigate`/`getParent` here. */
const navigation = {
  navigate: jest.fn(),
  getParent: jest.fn(() => undefined),
} as unknown as Props['navigation'];

/** A session started a minute ago so it lands in the default 12W period. */
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
        reps: 10,
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
  useHistoryStore.setState({ sessions: [recentSession()] });
  useHistoryFilterStore.setState({ filter: 'all' });
});

describe('ProgressScreen metric selector', () => {
  it('shows the volume hero by default', () => {
    render(<ProgressScreen navigation={navigation} route={{} as Props['route']} />);

    expect(screen.getByText('TOTAL VOLUME')).toBeTruthy();
    expect(screen.getByText('t')).toBeTruthy();
  });

  it('swaps to the sets hero without a unit', () => {
    render(<ProgressScreen navigation={navigation} route={{} as Props['route']} />);

    fireEvent.press(screen.getByTestId('progress-metric-sets'));

    expect(screen.getByText('TOTAL SETS')).toBeTruthy();
    expect(screen.queryByText('t')).toBeNull();
  });

  it('swaps to the time hero with an hours unit', () => {
    render(<ProgressScreen navigation={navigation} route={{} as Props['route']} />);

    fireEvent.press(screen.getByTestId('progress-metric-time'));

    expect(screen.getByText('TOTAL TIME')).toBeTruthy();
    expect(screen.getByText('h')).toBeTruthy();
  });

  it('preselects the History PR filter when the PR strip is tapped', () => {
    render(<ProgressScreen navigation={navigation} route={{} as Props['route']} />);

    fireEvent.press(screen.getByTestId('progress-pr-strip'));

    expect(useHistoryFilterStore.getState().filter).toBe('pr');
  });
});
