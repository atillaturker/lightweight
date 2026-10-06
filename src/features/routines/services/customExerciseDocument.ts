/**
 * Firestore document shape for a user-created exercise, plus the pure
 * merge used when a cloud read meets the device's copy.
 *
 * Schema:
 *
 *   users/{uid}/exercises/{exerciseId}:
 *     id, name, muscleGroup, equipment, measure, perSide,
 *     isArchived, createdAt, updatedAt      // epoch ms
 *
 * A custom exercise is never deleted, only archived: logged sets keep
 * referencing its id, and other devices need its name to show them.
 */
import type {
  Equipment,
  Exercise,
  ExerciseMeasure,
  MuscleGroup,
} from '@domain/entities';

/** The stored document. */
export interface CustomExerciseDocument {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  measure: ExerciseMeasure;
  perSide: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Prefix of every user-created exercise id. */
export const CUSTOM_EXERCISE_ID_PREFIX = 'custom-';

const MUSCLE_GROUPS: readonly MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
const EQUIPMENT: readonly Equipment[] = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'band',
];

/** Longest allowed exercise name, matching `firestore.rules`. */
export const CUSTOM_EXERCISE_NAME_MAX = 80;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Type guard for a stored custom-exercise document. */
export function isCustomExerciseDocument(value: unknown): value is CustomExerciseDocument {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.id.startsWith(CUSTOM_EXERCISE_ID_PREFIX) &&
    typeof value.name === 'string' &&
    value.name.trim() !== '' &&
    value.name.length <= CUSTOM_EXERCISE_NAME_MAX &&
    MUSCLE_GROUPS.includes(value.muscleGroup as MuscleGroup) &&
    EQUIPMENT.includes(value.equipment as Equipment) &&
    (value.measure === 'reps' || value.measure === 'time') &&
    typeof value.perSide === 'boolean' &&
    typeof value.isArchived === 'boolean' &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number'
  );
}

/** Convert a custom exercise into its document. */
export function toCustomExerciseDocument(exercise: Exercise): CustomExerciseDocument {
  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    measure: exercise.measure ?? 'reps',
    perSide: exercise.perSide === true,
    isArchived: exercise.isArchived,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt ?? exercise.createdAt,
  };
}

/** Convert a stored document back into a library exercise. */
export function fromCustomExerciseDocument(document: CustomExerciseDocument): Exercise {
  return {
    id: document.id,
    name: document.name,
    muscleGroup: document.muscleGroup,
    equipment: document.equipment,
    ...(document.measure === 'time' ? { measure: 'time' as const } : {}),
    ...(document.perSide ? { perSide: true } : {}),
    pictogramId: `ex-${document.id}`,
    isCustom: true,
    isArchived: document.isArchived,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

/** Result of merging the cloud copy with the device's. */
export interface CustomExerciseMerge {
  /** What both sides should end up holding, oldest first. */
  exercises: Exercise[];
  /** Local exercises the cloud lacks or holds an older copy of. */
  toUpload: Exercise[];
}

/** Last edit time of an exercise. */
function editedAt(exercise: Exercise): number {
  return exercise.updatedAt ?? exercise.createdAt;
}

/**
 * Union by id; when both sides hold an exercise, the newer edit wins
 * (the cloud on a tie). Local copies the cloud lacks, or that are newer,
 * are returned for upload.
 */
export function mergeCustomExercises(local: Exercise[], remote: Exercise[]): CustomExerciseMerge {
  const byId = new Map(remote.map((exercise) => [exercise.id, exercise]));
  const toUpload: Exercise[] = [];
  for (const exercise of local) {
    const cloud = byId.get(exercise.id);
    if (cloud === undefined || editedAt(exercise) > editedAt(cloud)) {
      byId.set(exercise.id, exercise);
      toUpload.push(exercise);
    }
  }
  const exercises = [...byId.values()].sort((a, b) => a.createdAt - b.createdAt);
  return { exercises, toUpload };
}
