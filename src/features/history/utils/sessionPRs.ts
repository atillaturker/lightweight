/**
 * Personal-record detection across the durable session history.
 *
 * The live set table flags PRs as sets are logged, but the domain `Set`
 * entity does not carry that flag once a workout is finished. To keep the
 * "PR only" filter honest, records are replayed here from the stored
 * history: sessions are walked oldest-first and each working set is
 * compared, via the domain rule, against the sets that preceded it.
 */
import type { Set as DomainSet, Workout } from '@domain/entities';
import { detectPRs, isWorkingSet } from '@domain/rules';

/** Session ids whose sets contain at least one personal record. */
export function sessionIdsWithPRs(sessions: Workout[]): Set<string> {
  const chronological = [...sessions].sort(
    (a, b) => a.startedAt - b.startedAt,
  );
  const historyByExercise = new Map<string, DomainSet[]>();
  const ids = new Set<string>();

  for (const session of chronological) {
    const ordered = [...session.sets].sort(
      (a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0),
    );

    for (const set of ordered) {
      const history = historyByExercise.get(set.exerciseId) ?? [];
      if (detectPRs(history, set).length > 0) {
        ids.add(session.id);
      }
      if (isWorkingSet(set)) {
        historyByExercise.set(set.exerciseId, [...history, set]);
      }
    }
  }

  return ids;
}
