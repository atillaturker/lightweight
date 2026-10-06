/**
 * Exercise picker filtering: search text, one muscle group, and any number
 * of equipment types ("what I own"). Pure, so the picker only renders.
 */
import type { Equipment, Exercise, MuscleGroup } from '@domain/entities';

/** Equipment chips, in display order. */
export const EQUIPMENT_OPTIONS: readonly { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'cable', label: 'Cable' },
  { value: 'machine', label: 'Machine' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Band' },
];

/** The picker's current filter. An empty equipment set means "any". */
export interface ExerciseFilter {
  query: string;
  group: MuscleGroup | null;
  equipment: ReadonlySet<Equipment>;
}

/** Whether an exercise matches the search text (name, equipment, target). */
function matchesQuery(exercise: Exercise, needle: string): boolean {
  if (needle === '') return true;
  return (
    exercise.name.toLowerCase().includes(needle) ||
    exercise.equipment.toLowerCase().includes(needle) ||
    (exercise.targetMuscle?.toLowerCase().includes(needle) ?? false)
  );
}

/** Whether an exercise passes the search and muscle-group parts of a filter. */
function matchesBase(exercise: Exercise, filter: ExerciseFilter, needle: string): boolean {
  if (filter.group !== null && exercise.muscleGroup !== filter.group) return false;
  return matchesQuery(exercise, needle);
}

/** The exercises that pass every part of the filter, in library order. */
export function filterExercises(library: Exercise[], filter: ExerciseFilter): Exercise[] {
  const needle = filter.query.trim().toLowerCase();
  return library.filter(
    (exercise) =>
      matchesBase(exercise, filter, needle) &&
      (filter.equipment.size === 0 || filter.equipment.has(exercise.equipment)),
  );
}

/**
 * Equipment chips worth showing: every type that still has results under
 * the search and muscle group, plus any type already selected (so it can
 * be turned off). Keeps every visible combination non-empty.
 */
export function visibleEquipment(
  library: Exercise[],
  filter: ExerciseFilter,
): Equipment[] {
  const needle = filter.query.trim().toLowerCase();
  const present = new Set<Equipment>();
  for (const exercise of library) {
    if (matchesBase(exercise, filter, needle)) present.add(exercise.equipment);
  }
  return EQUIPMENT_OPTIONS.map((option) => option.value).filter(
    (value) => present.has(value) || filter.equipment.has(value),
  );
}

/** Toggle one equipment type in a selection, returning a new set. */
export function toggleEquipment(
  selection: ReadonlySet<Equipment>,
  value: Equipment,
): Set<Equipment> {
  const next = new Set(selection);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
