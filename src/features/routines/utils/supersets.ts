/**
 * Superset grouping of routine slots.
 *
 * A superset is a run of consecutive slots sharing a `supersetGroup`. The
 * stored value is a letter (A, B, C…) by run position; a slot's label in
 * the UI is that letter plus its position in the run ("A1", "A2").
 * `normalizeSupersets` restores these invariants after any list change.
 */
import type { RoutineExercise } from '@domain/entities';

/** Letter for the n-th superset in a routine (0 → A). */
function groupLetter(index: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + (index % 26));
}

/** A copy of the slot without a superset group. */
function withoutGroup(slot: RoutineExercise): RoutineExercise {
  if (slot.supersetGroup === undefined) return slot;
  const { supersetGroup: _dropped, ...rest } = slot;
  return rest;
}

/**
 * Keep supersets valid: a group is a run of at least two consecutive
 * slots; runs are relabeled A, B, C… in order; lone members are cleared.
 * Expects `slots` in display order.
 */
export function normalizeSupersets(slots: RoutineExercise[]): RoutineExercise[] {
  const result: RoutineExercise[] = [];
  let runs = 0;
  let index = 0;
  while (index < slots.length) {
    const key = slots[index].supersetGroup;
    let end = index + 1;
    while (key !== undefined && end < slots.length && slots[end].supersetGroup === key) end += 1;
    const run = slots.slice(index, end);
    if (key === undefined || run.length < 2) {
      result.push(...run.map(withoutGroup));
    } else {
      const letter = groupLetter(runs);
      runs += 1;
      result.push(...run.map((slot) => ({ ...slot, supersetGroup: letter })));
    }
    index = end;
  }
  return result;
}

/**
 * Join the slot with the next one into a superset. If either is already
 * in a superset, the groups merge. No-op for the last slot.
 */
export function linkWithNext(
  slots: RoutineExercise[],
  exerciseId: string,
): RoutineExercise[] {
  const index = slots.findIndex((slot) => slot.exerciseId === exerciseId);
  if (index < 0 || index === slots.length - 1) return slots;
  const key = `link-${index}`;
  const merged = new Set(
    [slots[index].supersetGroup, slots[index + 1].supersetGroup].filter(
      (group): group is string => group !== undefined,
    ),
  );
  const linked = slots.map((slot, position) =>
    position === index ||
    position === index + 1 ||
    (slot.supersetGroup !== undefined && merged.has(slot.supersetGroup))
      ? { ...slot, supersetGroup: key }
      : slot,
  );
  return normalizeSupersets(linked);
}

/** Take the slot out of its superset; the rest of the group stays. */
export function unlinkFromSuperset(
  slots: RoutineExercise[],
  exerciseId: string,
): RoutineExercise[] {
  return normalizeSupersets(
    slots.map((slot) => (slot.exerciseId === exerciseId ? withoutGroup(slot) : slot)),
  );
}

/** "A1", "A2"… for each grouped slot, keyed by exercise id. */
export function supersetLabels(
  slots: Pick<RoutineExercise, 'exerciseId' | 'supersetGroup'>[],
): Map<string, string> {
  const labels = new Map<string, string>();
  let previous: string | undefined;
  let position = 0;
  for (const slot of slots) {
    if (slot.supersetGroup === undefined) {
      previous = undefined;
      continue;
    }
    position = slot.supersetGroup === previous ? position + 1 : 1;
    previous = slot.supersetGroup;
    labels.set(slot.exerciseId, `${slot.supersetGroup}${position}`);
  }
  return labels;
}
