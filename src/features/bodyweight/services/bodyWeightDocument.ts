/**
 * Firestore document shape for a body-weight entry.
 *
 *   users/{uid}/bodyweight/{YYYY-MM-DD}:
 *     date: string        // equals the document id
 *     weightKg: number    // 20–500
 *     updatedAt: number   // epoch ms; the newer side wins a merge
 *     deleted: boolean    // a removal, kept so other devices learn of it
 */
import type { BodyWeightEntry } from '@domain/entities';

/** The stored document. */
export interface BodyWeightDocument {
  date: string;
  weightKg: number;
  updatedAt: number;
  deleted: boolean;
}

/** Plausible body weight bounds, matching `firestore.rules`. */
export const BODY_WEIGHT_MIN_KG = 20;
export const BODY_WEIGHT_MAX_KG = 500;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Whether a weight is inside the plausible range. */
export function isPlausibleWeightKg(weightKg: number): boolean {
  return Number.isFinite(weightKg) && weightKg >= BODY_WEIGHT_MIN_KG && weightKg <= BODY_WEIGHT_MAX_KG;
}

/** Type guard for a stored entry. */
export function isBodyWeightDocument(value: unknown): value is BodyWeightDocument {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.date === 'string' &&
    DATE_PATTERN.test(record.date) &&
    typeof record.weightKg === 'number' &&
    isPlausibleWeightKg(record.weightKg) &&
    typeof record.updatedAt === 'number' &&
    typeof record.deleted === 'boolean'
  );
}

/** Convert an entry into its document. */
export function toBodyWeightDocument(entry: BodyWeightEntry): BodyWeightDocument {
  return { date: entry.date, weightKg: entry.weightKg, updatedAt: entry.updatedAt, deleted: entry.deleted === true };
}

/** Convert a stored document back into an entry. */
export function fromBodyWeightDocument(document: BodyWeightDocument): BodyWeightEntry {
  return {
    date: document.date,
    weightKg: document.weightKg,
    updatedAt: document.updatedAt,
    ...(document.deleted ? { deleted: true } : {}),
  };
}
