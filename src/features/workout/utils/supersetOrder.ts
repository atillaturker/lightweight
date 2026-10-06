/**
 * The order sets are logged in when a session contains supersets.
 *
 * Blocks outside a superset are logged set by set, top to bottom. A run of
 * consecutive blocks sharing a `supersetGroup` is logged round by round:
 * set 1 of each member, then set 2 of each member, and so on. Rest comes
 * only after the last exercise of a round, not between members.
 */
import type { ActiveExercise } from '../types';

/** A set, identified by the exercise that owns it. */
export interface SetRef {
  exerciseId: string;
  setId: string;
}

/** Consecutive blocks: a superset run, or a single block. */
function runs(exercises: ActiveExercise[]): ActiveExercise[][] {
  const result: ActiveExercise[][] = [];
  for (const block of exercises) {
    const last = result.at(-1);
    const group = block.supersetGroup;
    if (last !== undefined && group !== undefined && last[0].supersetGroup === group) {
      last.push(block);
    } else {
      result.push([block]);
    }
  }
  return result;
}

/** Sets of a run, round by round (a single block is one round per set). */
function runOrder(run: ActiveExercise[]): SetRef[] {
  const rounds = Math.max(...run.map((block) => block.sets.length));
  const refs: SetRef[] = [];
  for (let round = 0; round < rounds; round += 1) {
    for (const block of run) {
      const set = block.sets[round];
      if (set !== undefined) refs.push({ exerciseId: block.exerciseId, setId: set.id });
    }
  }
  return refs;
}

/** Every set of the session in the order it is logged. */
export function logicalSetOrder(exercises: ActiveExercise[]): SetRef[] {
  return runs(exercises).flatMap(runOrder);
}

/** Whether the set with this id has been completed. */
function isCompleted(exercises: ActiveExercise[], ref: SetRef): boolean {
  const block = exercises.find((entry) => entry.exerciseId === ref.exerciseId);
  return block?.sets.find((set) => set.id === ref.setId)?.completed ?? false;
}

/**
 * Whether to start rest after completing `setId`. Inside a superset the
 * rest waits until the round is over: if the next set still to log is a
 * later member of the same superset, keep going.
 */
export function shouldRestAfter(exercises: ActiveExercise[], setId: string): boolean {
  const order = logicalSetOrder(exercises);
  const position = order.findIndex((ref) => ref.setId === setId);
  if (position < 0) return true;
  const current = exercises.find((block) => block.exerciseId === order[position].exerciseId);
  if (current?.supersetGroup === undefined) return true;

  const next = order.slice(position + 1).find((ref) => !isCompleted(exercises, ref));
  if (next === undefined) return true;
  const nextBlock = exercises.find((block) => block.exerciseId === next.exerciseId);
  if (nextBlock?.supersetGroup !== current.supersetGroup) return true;
  return exercises.indexOf(nextBlock) <= exercises.indexOf(current);
}
