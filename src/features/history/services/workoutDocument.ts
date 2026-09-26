/**
 * Firestore document shape for a finished workout, and the pure conversion
 * to and from the domain `Workout`.
 *
 * Schema — `users/{uid}/workouts/{workoutId}`:
 *
 *   id            string
 *   routineId     string | null
 *   routineName   string
 *   startedAt     number   // epoch ms
 *   finishedAt    number | null
 *   note?         string
 *   sets          Array<{
 *     id, exerciseId, weightKg, reps, type, completed,
 *     rpe?, note?, completedAt, order, isPR?
 *   }>
 *
 * Timestamps are stored as epoch-millisecond numbers rather than Firestore
 * `Timestamp`s so a document round-trips to the exact domain shape without
 * a conversion layer at every read site. `undefined` is never written:
 * Firestore rejects it, so optional fields are omitted when absent.
 *
 * Security model assumed (documented, not enforced here): a user may read
 * and write only documents under their own `users/{uid}` path.
 */
import type { Set as DomainSet, SetType, Workout } from '@domain/entities';

/** One set as persisted in Firestore. */
export interface WorkoutSetDocument {
  id: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  type: SetType;
  completed: boolean;
  completedAt: number | null;
  order: number;
  rpe?: number;
  note?: string;
  isPR?: boolean;
}

/** One workout as persisted in Firestore. */
export interface WorkoutDocument {
  id: string;
  routineId: string | null;
  routineName: string;
  startedAt: number;
  finishedAt: number | null;
  note?: string;
  sets: WorkoutSetDocument[];
}

/** The valid `SetType` members, used when validating a read document. */
const SET_TYPES: readonly SetType[] = ['normal', 'warmup', 'drop', 'failure'];

/** Convert one domain set, omitting absent optional fields. */
function toSetDocument(set: DomainSet): WorkoutSetDocument {
  const document: WorkoutSetDocument = {
    id: set.id,
    exerciseId: set.exerciseId,
    weightKg: set.weightKg,
    reps: set.reps,
    type: set.type,
    completed: set.completed,
    completedAt: set.completedAt,
    order: set.order,
  };
  if (set.rpe !== undefined) document.rpe = set.rpe;
  if (set.note !== undefined) document.note = set.note;
  if (set.isPR !== undefined) document.isPR = set.isPR;
  return document;
}

/** Convert a domain workout into its Firestore document. */
export function toWorkoutDocument(workout: Workout): WorkoutDocument {
  const document: WorkoutDocument = {
    id: workout.id,
    routineId: workout.routineId,
    routineName: workout.routineName,
    startedAt: workout.startedAt,
    finishedAt: workout.finishedAt,
    sets: workout.sets.map(toSetDocument),
  };
  if (workout.note !== undefined) document.note = workout.note;
  return document;
}

/** True for a plain object (not null, not an array). */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validate the persisted `sets` array. */
function isSetDocumentArray(value: unknown): value is WorkoutSetDocument[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      if (!isRecord(entry)) return false;
      return (
        typeof entry.id === 'string' &&
        typeof entry.exerciseId === 'string' &&
        typeof entry.weightKg === 'number' &&
        typeof entry.reps === 'number' &&
        typeof entry.type === 'string' &&
        SET_TYPES.includes(entry.type as SetType) &&
        typeof entry.completed === 'boolean' &&
        (entry.completedAt === null || typeof entry.completedAt === 'number') &&
        typeof entry.order === 'number'
      );
    })
  );
}

/** Type guard for a stored workout document. */
export function isWorkoutDocument(value: unknown): value is WorkoutDocument {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    (value.routineId === null || typeof value.routineId === 'string') &&
    typeof value.routineName === 'string' &&
    typeof value.startedAt === 'number' &&
    (value.finishedAt === null || typeof value.finishedAt === 'number') &&
    isSetDocumentArray(value.sets)
  );
}

/** Convert one stored set back into the domain `Set`. */
function fromSetDocument(
  set: WorkoutSetDocument,
  workoutId: string,
): DomainSet {
  return {
    id: set.id,
    exerciseId: set.exerciseId,
    workoutId,
    weightKg: set.weightKg,
    reps: set.reps,
    type: set.type,
    completed: set.completed,
    rpe: set.rpe,
    note: set.note,
    completedAt: set.completedAt,
    order: set.order,
    isPR: set.isPR,
  };
}

/**
 * Convert a stored document back into a domain workout.
 *
 * The document id wins over any embedded `id` field, because the storage
 * path is the authority for identity. Throws when the document is invalid
 * so a corrupt record surfaces instead of silently becoming a partial
 * workout.
 */
export function fromWorkoutDocument(id: string, data: unknown): Workout {
  if (!isWorkoutDocument(data)) {
    throw new Error(`Invalid workout document: ${id}`);
  }
  const workout: Workout = {
    id,
    routineId: data.routineId,
    routineName: data.routineName,
    startedAt: data.startedAt,
    finishedAt: data.finishedAt,
    sets: data.sets.map((set) => fromSetDocument(set, id)),
  };
  if (data.note !== undefined) workout.note = data.note;
  return workout;
}
