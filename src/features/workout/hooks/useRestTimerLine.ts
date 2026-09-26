/**
 * Presentation values for the rest-timer line.
 *
 * The timer bar shrinks as the rest elapses, so it needs a ratio rather
 * than a countdown. Keeping that math out of the screen means the bar's
 * behavior is testable and the screen stays layout-only.
 *
 * The ratio is derived from the rest deadline alone, so a throttled tick
 * can never make the bar jump: it is `remaining / total`, where `total` is
 * the full rest that was started.
 */
import { useMemo } from 'react';

import { formatClock } from '@lib/format';

import { useRestTimer } from './useRestTimer';

/** Everything the rest line renders. */
export interface RestTimerLine {
  /** Whether a rest is currently running. */
  isResting: boolean;
  /** Seconds left, floored at zero. */
  remainingSeconds: number;
  /** Remaining rest as a fraction of the rest that was started, 0–1. */
  ratio: number;
  /** Countdown text, e.g. `1:30`. */
  label: string;
  /** Start a rest of `seconds` length. */
  start: (seconds: number) => void;
  /** Stop resting immediately. */
  stop: () => void;
}

/** Longest rest the bar is scaled against, so short rests still read. */
const MINIMUM_SCALE_SECONDS = 60;

/**
 * Derive the rest line's values from the shared rest timer. Returns a
 * zeroed, non-resting line whenever no rest is running.
 */
export function useRestTimerLine(): RestTimerLine {
  const { isResting, restEndsAt, remainingSeconds, start, stop } =
    useRestTimer();

  return useMemo((): RestTimerLine => {
    if (!isResting || restEndsAt === null) {
      return {
        isResting: false,
        remainingSeconds: 0,
        ratio: 0,
        label: '0:00',
        start,
        stop,
      };
    }

    const elapsedSeconds =
      (Date.now() - (restEndsAt - remainingSeconds * 1000)) / 1000;
    const totalSeconds = Math.max(
      elapsedSeconds + remainingSeconds,
      MINIMUM_SCALE_SECONDS,
    );

    return {
      isResting: true,
      remainingSeconds,
      ratio: totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds,
      label: formatClock(remainingSeconds),
      start,
      stop,
    };
  }, [isResting, remainingSeconds, restEndsAt, start, stop]);
}
