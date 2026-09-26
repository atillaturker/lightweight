/**
 * Persist personal-record flags onto a finished workout.
 *
 * Detection must run against everything the user has ever lifted, not just
 * the session being closed. Replaying detection over a session alone marks
 * the first working set of every exercise as a record, because it is
 * compared only against the sets before it inside that same session.
 *
 * This module walks the finished workout in completion order, comparing
 * each working set against every prior working set for the same exercise
 * drawn from the supplied history. The resulting `isPR` flag is written on
 * the domain `Set` and becomes the authoritative answer for every read-only
 * view.
 */
import type { Set as DomainSet, Workout } from '@domain/entities';
import { detectPRs } from '@domain/rules';
import { isWorkingSet } from '@domain/rules/e1rm';

/** Group an existing session list into working sets keyed by exercise. */
function toWorkingSetsByExercise(history: Workout[]): Map<string, DomainSet[]> {
  const byExercise = new Map<string, DomainSet[]>();
  for (const session of history) {
    for (const set of session.sets) {
      if (!isWorkingSet(set)) continue;
      const existing = byExercise.get(set.exerciseId);
      if (existing === undefined) byExercise.set(set.exerciseId, [set]);
      else existing.push(set);
    }
  }
  return byExercise;
}

/** Sort sets by completion time, falling back to insertion order. */
function inCompletionOrder(sets: DomainSet[]): DomainSet[] {
  return [...sets].sort(
    (a, b) => (a.completedAt ?? Infinity) - (b.completedAt ?? Infinity),
  );
}

/**
 * Return a copy of `workout` whose sets carry an authoritative `isPR` flag.
 *
 * `history` should contain every previously recorded session. A session in
 * `history` with the same id as `workout` is ignored, so passing the whole
 * store (including the session under test) is safe.
 */
export function applyPRFlags(workout: Workout, history: Workout[]): Workout {
  const byExercise = toWorkingSetsByExercise(
    history.filter((session) => session.id !== workout.id),
  );
  const flags = new Map<string, boolean>();

  for (const set of inCompletionOrder(workout.sets)) {
    const prior = byExercise.get(set.exerciseId) ?? [];
    flags.set(set.id, detectPRs(prior, set).length > 0);
    if (isWorkingSet(set)) {
      byExercise.set(set.exerciseId, [...prior, set]);
    }
  }

  return {
    ...workout,
    sets: workout.sets.map((set) => ({
      ...set,
      isPR: flags.get(set.id) ?? false,
    })),
  };
}
