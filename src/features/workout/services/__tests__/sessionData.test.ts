/**
 * Tests for the workout feature's data seams.
 *
 * The rest-timer provider is the bridge that lets the profile feature's
 * preference reach the workout loop without a cross-feature import. These
 * pin the default and the swap/reset behavior the integration relies on.
 */
import type { Workout } from '@domain/entities';

import { DEFAULT_REST_SECONDS } from '../../config';
import {
  getRestTimerSeconds,
  recordSession,
  resetSessionDataProviders,
  setRestTimerSecondsProvider,
  setSessionRecorder,
} from '../sessionData';

afterEach(() => {
  resetSessionDataProviders();
});

/** Build a minimal finished workout. */
function makeWorkout(id: string): Workout {
  return {
    id,
    routineId: null,
    routineName: 'Push',
    startedAt: 1,
    finishedAt: 2,
    sets: [],
  };
}

describe('rest timer provider', () => {
  it('defaults to the workout constant', () => {
    expect(getRestTimerSeconds()).toBe(DEFAULT_REST_SECONDS);
  });

  it('uses a registered preference source', () => {
    setRestTimerSecondsProvider(() => 120);

    expect(getRestTimerSeconds()).toBe(120);
  });

  it('falls back to the default after reset', () => {
    setRestTimerSecondsProvider(() => 120);

    resetSessionDataProviders();

    expect(getRestTimerSeconds()).toBe(DEFAULT_REST_SECONDS);
  });
});

describe('session recorder', () => {
  it('forwards a finished workout to a registered recorder', () => {
    const recorded: Workout[] = [];
    setSessionRecorder((workout) => recorded.push(workout));
    const workout = makeWorkout('session-1');

    recordSession(workout);

    expect(recorded).toEqual([workout]);
  });

  it('is a no-op when no recorder is registered', () => {
    expect(() => recordSession(makeWorkout('session-1'))).not.toThrow();
  });

  it('ignores a recorder after reset', () => {
    const recorded: Workout[] = [];
    setSessionRecorder((workout) => recorded.push(workout));

    resetSessionDataProviders();
    recordSession(makeWorkout('session-1'));

    expect(recorded).toEqual([]);
  });
});
