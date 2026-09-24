import { Set } from './Set';

/**
 * A training session: an ordered collection of logged sets.
 */
export interface Workout {
  id: string;
  /** Null when the session was started without a routine. */
  routineId: string | null;
  /** Snapshot of the routine name — the routine may be renamed later. */
  routineName: string;
  startedAt: number;
  finishedAt: number | null;
  sets: Set[];
  note?: string;
}
