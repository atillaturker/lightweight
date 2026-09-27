/**
 * Integration tests for the Active Workout primary CTA.
 *
 * These pin the two logging behaviors the screen must guarantee: tapping
 * "Log set" with no cell focused completes the first incomplete set (it must
 * never return silently), and once every set is complete the CTA reads
 * "All sets done" and can no longer log. The scroll reveal is driven by
 * native measurement and is intentionally not asserted here.
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

// PR detection runs after interactions and is covered by its own domain
// tests; disabling it here keeps the logging assertions synchronous.
jest.mock('@domain/rules', () => ({
  detectPRs: () => [],
}));

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Workout } from '@domain/entities';
import type { TodayStackParamList } from '@/app/navigation/types';

import { ActiveWorkoutScreen } from '../screens/ActiveWorkoutScreen';
import {
  resetSessionDataProviders,
  setRestTimerSecondsProvider,
} from '../services';
import {
  EMPTY_WORKOUT,
  useActiveWorkoutStore,
  useLastSessionStore,
} from '../store';
import type { ActiveExercise, ActiveSet } from '../types';

type Props = NativeStackScreenProps<TodayStackParamList, 'ActiveWorkout'>;

/** Navigation double capturing the exit-path calls the screen makes. */
const popToTop = jest.fn();
const replace = jest.fn();
const navigation = { popToTop, replace } as unknown as Props['navigation'];

/** Route double; the live screen ignores its params. */
const route = { params: {} } as Props['route'];

/** Build a set with only the fields the screen renders. */
function makeSet(id: string, completed: boolean): ActiveSet {
  return {
    id,
    weightKg: 60,
    reps: 8,
    type: 'normal',
    completed,
    completedAt: completed ? 1 : null,
    isPR: false,
  };
}

/** Build an exercise block from its sets. */
function makeExercise(exerciseId: string, sets: ActiveSet[]): ActiveExercise {
  return { exerciseId, name: exerciseId, pictogramId: exerciseId, order: 0, sets };
}

/** Seed the store with an open session holding one exercise block. */
function seedSession(sets: ActiveSet[]): void {
  useActiveWorkoutStore.setState({
    ...EMPTY_WORKOUT,
    sessionId: 'session-1',
    routineName: 'Push',
    startedAt: 1,
    exercises: [makeExercise('bench', sets)],
  });
}

beforeEach(() => {
  mockMemory.clear();
  popToTop.mockClear();
  replace.mockClear();
  useActiveWorkoutStore.setState({ ...EMPTY_WORKOUT });
  useLastSessionStore.setState({ lastSession: null });
});

afterEach(() => {
  resetSessionDataProviders();
});

describe('ActiveWorkoutScreen primary CTA', () => {
  it('logs the first incomplete set when no cell is focused', () => {
    seedSession([makeSet('s1', false), makeSet('s2', false)]);
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByTestId('active-workout-cta'));

    const sets = useActiveWorkoutStore.getState().exercises[0].sets;
    expect(sets[0].completed).toBe(true);
    expect(sets[1].completed).toBe(false);
  });

  it('advances the target to the next set after each log', () => {
    seedSession([makeSet('s1', false), makeSet('s2', false)]);
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByTestId('active-workout-cta'));
    fireEvent.press(screen.getByTestId('active-workout-cta'));

    const sets = useActiveWorkoutStore.getState().exercises[0].sets;
    expect(sets.every((set) => set.completed)).toBe(true);
  });

  it('starts rest from the registered preference, not the default', () => {
    setRestTimerSecondsProvider(() => 120);
    seedSession([makeSet('s1', false)]);
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    const before = Date.now();
    fireEvent.press(screen.getByTestId('active-workout-cta'));
    const after = Date.now();

    const { restEndsAt } = useActiveWorkoutStore.getState();
    expect(restEndsAt).not.toBeNull();
    expect(restEndsAt).toBeGreaterThanOrEqual(before + 120_000);
    expect(restEndsAt).toBeLessThanOrEqual(after + 120_000);
  });

  it('shows a disabled "All sets done" CTA when every set is complete', () => {
    seedSession([makeSet('s1', true), makeSet('s2', true)]);
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    const cta = screen.getByTestId('active-workout-cta');
    expect(cta.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
    expect(screen.getByText('All sets done')).toBeTruthy();

    fireEvent.press(cta);
    expect(useActiveWorkoutStore.getState().exercises[0].sets).toHaveLength(2);
  });
});

/** Open the exit sheet from the header, then choose Finish. */
function finishWorkout(): void {
  fireEvent.press(screen.getByTestId('active-workout-header-finish'));
  fireEvent.press(screen.getByTestId('active-workout-exit-finish'));
}

describe('ActiveWorkoutScreen exit sheet', () => {
  it('replaces the active screen with WorkoutSummary for the finished session', () => {
    seedSession([makeSet('s1', true)]);
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    finishWorkout();

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('WorkoutSummary', {
      sessionId: 'session-1',
    });
    expect(popToTop).not.toHaveBeenCalled();
  });

  it('hands the finished workout to lastSessionStore before navigating', () => {
    seedSession([makeSet('s1', true)]);
    const captured: { workout: Workout | null } = { workout: null };
    replace.mockImplementationOnce(() => {
      captured.workout = useLastSessionStore.getState().lastSession;
    });
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    finishWorkout();

    expect(captured.workout).not.toBeNull();
    expect(captured.workout?.id).toBe('session-1');
    expect(captured.workout?.routineName).toBe('Push');
  });

  it('discards the session without opening the summary', () => {
    seedSession([makeSet('s1', false)]);
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByTestId('active-workout-header-finish'));
    fireEvent.press(screen.getByTestId('active-workout-exit-discard'));

    expect(replace).not.toHaveBeenCalled();
    expect(popToTop).toHaveBeenCalledTimes(1);
    expect(useActiveWorkoutStore.getState().sessionId).toBeNull();
    expect(useLastSessionStore.getState().lastSession).toBeNull();
  });

  it('keeps training when the sheet is dismissed', () => {
    seedSession([makeSet('s1', false)]);
    render(<ActiveWorkoutScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByTestId('active-workout-header-finish'));
    fireEvent.press(screen.getByTestId('active-workout-exit-keep'));

    expect(replace).not.toHaveBeenCalled();
    expect(popToTop).not.toHaveBeenCalled();
    expect(useActiveWorkoutStore.getState().sessionId).toBe('session-1');
  });
});
