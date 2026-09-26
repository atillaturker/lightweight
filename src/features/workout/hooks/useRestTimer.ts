/**
 * Rest-timer hook.
 *
 * `remainingSeconds` is derived from `restEndsAt` on every tick rather
 * than decremented, so a throttled interval or a suspended app can never
 * drift away from the real deadline. The countdown stops itself at zero.
 */
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useActiveWorkoutStore } from '../store';

/** Values returned by {@link useRestTimer}. */
export interface UseRestTimerResult {
  isResting: boolean;
  restEndsAt: number | null;
  /** Seconds left, floored at 0. 0 while not resting. */
  remainingSeconds: number;
  /** Start a rest of `seconds` length. */
  start: (seconds: number) => void;
  /** Stop resting immediately. */
  stop: () => void;
}

/** Milliseconds between countdown ticks. */
const TICK_MS = 1000;

/** Whole seconds left before `restEndsAt`, never negative. */
function secondsLeft(restEndsAt: number | null): number {
  if (restEndsAt === null) return 0;
  return Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
}

/**
 * Countdown for the rest between sets. Renders as a thin line, never as
 * an overlay — the caller owns the presentation.
 */
export function useRestTimer(): UseRestTimerResult {
  const { isResting, restEndsAt } = useActiveWorkoutStore(
    useShallow((state) => ({
      isResting: state.isResting,
      restEndsAt: state.restEndsAt,
    })),
  );
  const startRest = useActiveWorkoutStore((state) => state.startRest);
  const stopRest = useActiveWorkoutStore((state) => state.stopRest);

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    secondsLeft(restEndsAt),
  );

  useEffect(() => {
    if (!isResting) {
      setRemainingSeconds(0);
      return undefined;
    }

    setRemainingSeconds(secondsLeft(restEndsAt));

    const timer = setInterval(() => {
      const left = secondsLeft(restEndsAt);
      setRemainingSeconds(left);
      if (left <= 0) stopRest();
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [isResting, restEndsAt, stopRest]);

  const start = useCallback(
    (seconds: number): void => {
      startRest(seconds);
    },
    [startRest],
  );

  const stop = useCallback((): void => {
    stopRest();
  }, [stopRest]);

  return { isResting, restEndsAt, remainingSeconds, start, stop };
}
