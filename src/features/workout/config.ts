/**
 * Feature-level defaults for the training loop.
 *
 * These are the values used until the user's own preferences are wired
 * through: `DEFAULT_WEEKLY_SESSION_GOAL` mirrors the frequency chosen in
 * onboarding and `DEFAULT_WEEK_START` mirrors the domain default, but
 * neither is readable from this feature yet (the onboarding draft is
 * transient and preferences are not part of the auth user).
 */
import type { WeekStart } from '@domain/entities';

/** Rest period started after a set is completed, in seconds. */
export const DEFAULT_REST_SECONDS = 90;

/** Weekly session goal used for the Home frequency ring. */
export const DEFAULT_WEEKLY_SESSION_GOAL = 5;

/** Week boundary used for weekly aggregation. */
export const DEFAULT_WEEK_START: WeekStart = 'monday';

/** How many past sessions the Home screen lists. */
export const RECENT_ACTIVITY_LIMIT = 3;

/** Endpoint the finished session is posted to. */
export const WORKOUTS_ENDPOINT = '/workouts';
