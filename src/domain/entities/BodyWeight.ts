/**
 * One day's body-weight entry. At most one per local calendar day: logging
 * again that day replaces it. A removed entry is kept as `deleted` so other
 * devices learn about the removal.
 */
export interface BodyWeightEntry {
  /** Local calendar day, `YYYY-MM-DD`. Also the entry's identity. */
  date: string;
  /** Always kilograms; unit conversion happens at the UI edge. */
  weightKg: number;
  /** Last change, epoch ms; the newer side wins a sync merge. */
  updatedAt: number;
  /** Removed by the user (a tombstone). */
  deleted?: boolean;
}
