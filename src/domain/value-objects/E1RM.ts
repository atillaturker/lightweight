/**
 * A best estimated one-rep-max and the set that produced it.
 */
export interface E1RMResult {
  /** Estimated 1RM in kilograms. */
  value: number;
  sourceSet: { weightKg: number; reps: number };
}
