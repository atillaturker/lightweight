/**
 * Pure helpers for the device-local onboarding record.
 *
 * Firebase is the only writer of the auth `user` object and it knows nothing
 * about first-run setup, so a fresh user object arrives on every cold start
 * and every sign-in with no onboarding answer attached. The auth store
 * therefore keeps a separate record of which uids have finished setup; the
 * user object is filled from it whenever Firebase emits a session.
 *
 * The record is a list rather than a single boolean so two accounts on one
 * device each keep their own answer. It lives outside `user`, which is what
 * lets it survive a sign-out.
 */

/** Whether `uid` is recorded as having completed first-run onboarding. */
export function isOnboarded(uids: readonly string[], uid: string): boolean {
  return uids.includes(uid);
}

/**
 * Add `uid` to the record.
 *
 * Idempotent. Returns the input array unchanged when `uid` is already
 * recorded, so subscribers keyed on this slice are not re-rendered for
 * nothing; callers must treat the result as immutable.
 */
export function markOnboarded(uids: string[], uid: string): string[] {
  if (isOnboarded(uids, uid)) return uids;
  return [...uids, uid];
}
