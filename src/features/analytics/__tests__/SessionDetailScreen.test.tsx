/**
 * Behavior tests for the Session Detail screen.
 *
 * The screen is a read model over the durable history store with a repeat
 * CTA. These tests pin that it resolves a past session by id, renders the
 * domain-rule totals, one block per exercise, and hides the PR section when
 * the session set no records. Navigation is mocked; the screen is not tested
 * visually.
 */
import { fireEvent, render, screen, within } from '@testing-library/react-native';
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

import type { Set as DomainSet, Workout } from '@domain/entities';
import { formatLongDateTime } from '@lib/format';
import { registerDataProviders } from '@/app/providers';
import { useHistoryStore } from '@features/history/store';
import { resetSessionDataProviders } from '@features/workout';

import type { HistoryStackParamList } from '@/app/navigation/types';

import { SessionDetailScreen } from '../screens/SessionDetailScreen';

type Props = NativeStackScreenProps<HistoryStackParamList, 'SessionDetail'>;

/** Navigation spies; the screen reads `goBack`, `getParent`, and `navigate`. */
const goBack = jest.fn();
const getParent = jest.fn();
const navigate = jest.fn();
const navigation = { goBack, getParent, navigate } as unknown as Props['navigation'];

/** Route double carrying the session id under test. */
const route = { params: { sessionId: 'session-1' } } as Props['route'];

/** 40 minutes after the session start. */
const STARTED_AT = Date.UTC(2026, 3, 2, 18, 42, 0);
const FINISHED_AT = STARTED_AT + 40 * 60_000;

/** Build a domain set with only the fields the detail model reads. */
function makeSet(
  id: string,
  exerciseId: string,
  weightKg: number,
  reps: number,
  overrides: Partial<DomainSet> = {},
): DomainSet {
  return {
    id,
    exerciseId,
    workoutId: 'session-1',
    weightKg,
    reps,
    type: 'normal',
    completed: true,
    completedAt: STARTED_AT,
    order: 0,
    ...overrides,
  };
}

/** A session with two exercises and three working sets (1,800kg). */
const SESSION: Workout = {
  id: 'session-1',
  routineId: 'routine-1',
  routineName: 'Upper / Lower',
  startedAt: STARTED_AT,
  finishedAt: FINISHED_AT,
  sets: [
    makeSet('s1', 'bench-press', 80, 8),
    makeSet('s2', 'bench-press', 80, 7, { order: 1 }),
    makeSet('s3', 'barbell-row', 60, 10),
  ],
};

beforeEach(() => {
  mockMemory.clear();
  goBack.mockClear();
  getParent.mockClear();
  navigate.mockClear();
  getParent.mockReturnValue(undefined);
  useHistoryStore.setState({ sessions: [SESSION] });
  registerDataProviders();
});

afterEach(() => {
  resetSessionDataProviders();
});

describe('SessionDetailScreen', () => {
  it('renders the routine name and the session date and time', () => {
    render(<SessionDetailScreen navigation={navigation} route={route} />);

    expect(screen.getByText('Upper / Lower')).toBeTruthy();
    expect(screen.getByText(formatLongDateTime(STARTED_AT))).toBeTruthy();
  });

  it('renders one exercise block per exercise in the session', () => {
    render(<SessionDetailScreen navigation={navigation} route={route} />);

    expect(screen.getByTestId('session-detail-block-0')).toBeTruthy();
    expect(screen.getByTestId('session-detail-block-1')).toBeTruthy();
    expect(screen.queryByTestId('session-detail-block-2')).toBeNull();
  });

  it('renders volume, sets, and reps from the domain rules', () => {
    render(<SessionDetailScreen navigation={navigation} route={route} />);

    expect(
      within(screen.getByTestId('session-detail-volume')).getByText('1.8t'),
    ).toBeTruthy();
    expect(
      within(screen.getByTestId('session-detail-sets')).getByText('3'),
    ).toBeTruthy();
    expect(
      within(screen.getByTestId('session-detail-reps')).getByText('25'),
    ).toBeTruthy();
  });

  it('opens Exercise Detail when an exercise block header is tapped', () => {
    render(<SessionDetailScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByTestId('session-detail-block-0-header'));

    expect(navigate).toHaveBeenCalledWith('ExerciseDetailFromHistory', {
      exerciseId: 'bench-press',
    });
  });

  it('renders the "Repeat this workout" primary CTA', () => {
    render(<SessionDetailScreen navigation={navigation} route={route} />);

    const cta = screen.getByTestId('session-detail-repeat');
    expect(cta).toBeTruthy();
    expect(screen.getByText('Repeat this workout')).toBeTruthy();
  });

  it('hides the PR section when the session set no records', () => {
    const warmupOnly: Workout = {
      ...SESSION,
      sets: [
        makeSet('w1', 'bench-press', 40, 10, { type: 'warmup' }),
      ],
    };
    useHistoryStore.setState({ sessions: [warmupOnly] });

    render(<SessionDetailScreen navigation={navigation} route={route} />);

    expect(screen.queryByTestId('session-detail-prs')).toBeNull();
  });

  it('shows the PR section when the session set a record', () => {
    render(<SessionDetailScreen navigation={navigation} route={route} />);

    expect(screen.getByTestId('session-detail-prs')).toBeTruthy();
  });

  it('reports a missing session instead of rendering blanks', () => {
    const missingRoute = {
      params: { sessionId: 'does-not-exist' },
    } as Props['route'];

    render(<SessionDetailScreen navigation={navigation} route={missingRoute} />);

    expect(screen.getByTestId('session-detail-missing')).toBeTruthy();
  });
});
