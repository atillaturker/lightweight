/**
 * Firestore document shape for `users/{uid}`, plus the pure rules that
 * decide how a cloud read merges with the local device.
 *
 * Schema:
 *
 *   users/{uid}:
 *     hasOnboarded: boolean
 *     preferences: {
 *       unit, weekStart, rpeEnabled, restTimerSeconds, notificationsEnabled
 *     }
 *     createdAt: number   // epoch ms
 *     updatedAt: number   // epoch ms
 *
 * Timestamps are epoch-millisecond numbers for the same reason as the
 * workout documents: no conversion layer at the read site.
 *
 * Security model assumed (documented, not enforced here): a user may read
 * and write only their own `users/{uid}` document.
 */
import type { UserPreferences, WeekStart, WeightUnit } from '@domain/entities';

/** The stored profile document. */
export interface UserProfileDocument {
  hasOnboarded: boolean;
  preferences: UserPreferences;
  createdAt?: number;
  updatedAt?: number;
}

/** Result of merging a cloud preference document with the local store. */
export interface PreferenceMerge {
  /** The preferences that should end up on both sides. */
  preferences: UserPreferences;
  /** True when the local copy must be pushed back to Firestore. */
  pushLocal: boolean;
}

const UNITS: readonly WeightUnit[] = ['kg', 'lb'];
const WEEK_STARTS: readonly WeekStart[] = ['monday', 'sunday'];

/** True for a plain object (not null, not an array). */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validate a stored preferences object. */
export function isUserPreferences(value: unknown): value is UserPreferences {
  if (!isRecord(value)) return false;
  return (
    UNITS.includes(value.unit as WeightUnit) &&
    WEEK_STARTS.includes(value.weekStart as WeekStart) &&
    typeof value.rpeEnabled === 'boolean' &&
    typeof value.restTimerSeconds === 'number' &&
    typeof value.notificationsEnabled === 'boolean'
  );
}

/** Type guard for a stored profile document. */
export function isUserProfileDocument(
  value: unknown,
): value is UserProfileDocument {
  if (!isRecord(value)) return false;
  return (
    typeof value.hasOnboarded === 'boolean' &&
    isUserPreferences(value.preferences)
  );
}

/** Validate and project a raw profile document, or `null` when invalid. */
export function parseUserProfile(value: unknown): UserProfileDocument | null {
  return isUserProfileDocument(value) ? value : null;
}

/** True when every preference still equals its default value. */
export function isDefaultPreferences(
  preferences: UserPreferences,
  defaults: UserPreferences,
): boolean {
  return (
    preferences.unit === defaults.unit &&
    preferences.weekStart === defaults.weekStart &&
    preferences.rpeEnabled === defaults.rpeEnabled &&
    preferences.restTimerSeconds === defaults.restTimerSeconds &&
    preferences.notificationsEnabled === defaults.notificationsEnabled
  );
}

/**
 * Decide the preference winner when cloud and local copies meet.
 *
 * Policy (documented for this foundation batch):
 * - No cloud preferences: keep local and push it up, so the cloud gets a
 *   baseline on first sign-in.
 * - Local still at its defaults: adopt the cloud value — the user has not
 *   expressed a preference on this device, so the other device wins.
 * - Otherwise: local wins and is pushed up. There is no field-level merge
 *   policy yet, so the whole document is replaced.
 */
export function resolvePreferences(
  local: UserPreferences,
  remote: UserPreferences | null,
  defaults: UserPreferences,
): PreferenceMerge {
  if (remote === null) return { preferences: local, pushLocal: true };
  if (isDefaultPreferences(local, defaults)) {
    return { preferences: remote, pushLocal: false };
  }
  return { preferences: local, pushLocal: true };
}
