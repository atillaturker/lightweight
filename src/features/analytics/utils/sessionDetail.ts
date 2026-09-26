/**
 * Read model for the Session Detail screen.
 *
 * Turns one finished domain `Workout` into exactly what the screen renders:
 * the four-metric totals, one read-only block per exercise, and the
 * personal-record roll-up. Every figure comes from `@domain/rules`; the
 * exercise names are resolved against the provided library. Pure — the
 * caller supplies the library and the current time.
 */
import type { Exercise, Set as DomainSet, Workout } from '@domain/entities';
import { calculateVolume, summarizeVolume } from '@domain/rules';
import { formatTonnage, formatMinutesBetween } from '@lib/format';
import type { ActiveExercise, ActiveSet, PRSummaryRow } from '@features/workout';
import { summarizeSessionPRs } from '@features/workout';

/** Props-ready model for one exercise block of a past session. */
export interface SessionExerciseBlockModel {
  exercise: ActiveExercise;
  /** `<N> sets · <volume>`, shown at the right of the block title. */
  summary: string;
}

/** Everything the Session Detail screen renders. */
export interface SessionDetailModel {
  /** The session, or `null` when the id is not in history. */
  session: Workout | null;
  /** Total volume in kilograms, warmups excluded. */
  volumeKg: number;
  /** Completed working sets. */
  sets: number;
  /** Total reps across working sets. */
  reps: number;
  /** Session length in whole minutes, floored at one. */
  minutes: number;
  /** One block per exercise, ordered by first appearance. */
  exercises: SessionExerciseBlockModel[];
  /** One row per exercise that set a record. Empty when none did. */
  personalRecords: PRSummaryRow[];
}

/** The all-zero model rendered when the session cannot be found. */
function missingSession(): SessionDetailModel {
  return {
    session: null,
    volumeKg: 0,
    sets: 0,
    reps: 0,
    minutes: 0,
    exercises: [],
    personalRecords: [],
  };
}

/** Map one exercise's completed sets into the read-only active-set shape. */
function toActiveSets(sets: DomainSet[]): ActiveSet[] {
  return sets.map((set) => ({
    id: set.id,
    weightKg: set.weightKg,
    reps: set.reps,
    type: set.type,
    completed: true,
    completedAt: set.completedAt,
    // The persisted flag is authoritative for historical views.
    isPR: set.isPR ?? false,
  }));
}

/** Working sets from every session that started before `session`. */
function priorWorkingSets(
  session: Workout,
  allSessions: Workout[],
): DomainSet[] {
  return allSessions
    .filter((entry) => entry.id !== session.id && entry.startedAt < session.startedAt)
    .flatMap((entry) => entry.sets);
}

/** Group a session's completed sets by exercise, preserving first-appearance order. */
function groupCompletedSets(sets: DomainSet[]): Map<string, DomainSet[]> {
  const grouped = new Map<string, DomainSet[]>();
  for (const set of sets) {
    if (!set.completed) continue;
    const existing = grouped.get(set.exerciseId);
    if (existing === undefined) grouped.set(set.exerciseId, [set]);
    else existing.push(set);
  }
  return grouped;
}

/** Turn the grouped sets into one read-only block per exercise. */
function toBlocks(
  grouped: Map<string, DomainSet[]>,
  byId: Map<string, Exercise>,
): SessionExerciseBlockModel[] {
  return Array.from(grouped.entries()).map(([exerciseId, sets], index) => {
    const meta = byId.get(exerciseId);
    const setCount = sets.length;
    return {
      exercise: {
        exerciseId,
        name: meta?.name ?? 'Unknown exercise',
        pictogramId: meta?.pictogramId ?? '',
        order: index,
        sets: toActiveSets(sets),
      },
      summary: `${setCount} ${setCount === 1 ? 'set' : 'sets'} · ${formatTonnage(
        calculateVolume(sets),
      )}`,
    };
  });
}

/**
 * Build the session detail model. `library` supplies exercise names and
 * pictograms; `now` is used only to measure a session that never finished.
 */
export function buildSessionDetail(
  session: Workout | null,
  now: number,
  library: Exercise[],
  allSessions: Workout[] = [],
): SessionDetailModel {
  if (session === null) return missingSession();

  const totals = summarizeVolume(session.sets);
  const byId = new Map(library.map((exercise) => [exercise.id, exercise]));
  const names = new Map(library.map((exercise) => [exercise.id, exercise.name]));

  return {
    session,
    volumeKg: totals.total,
    sets: totals.sets,
    reps: totals.reps,
    minutes: formatMinutesBetween(session.startedAt, session.finishedAt, now),
    exercises: toBlocks(groupCompletedSets(session.sets), byId),
    personalRecords: summarizeSessionPRs(
      session.sets,
      names,
      priorWorkingSets(session, allSessions),
    ),
  };
}
