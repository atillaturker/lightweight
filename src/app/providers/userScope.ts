/**
 * Keep every user-owned store scoped to the signed-in account.
 *
 * History, routines, the active workout and preferences are persisted per
 * uid (`<key>:<uid>`), so a sign-out followed by a different sign-in on the
 * same device never shows or writes the previous account's data. Nothing
 * is deleted on sign-out: routines and an unfinished workout exist only on
 * the device, so the account keeps them for when it signs back in.
 *
 * The switch runs from a synchronous auth-store subscription, so the new
 * account's data is in place before React renders the next screen.
 */
import { useAuthStore } from '@features/auth/store';
import { HISTORY_STORE_KEY, useHistoryFilterStore, useHistoryStore } from '@features/history/store';
import { PREFERENCES_STORE_KEY, usePreferencesStore } from '@features/profile/store';
import { ROUTINES_STORE_KEY, useRoutineStore } from '@features/routines/store';
import {
  ACTIVE_WORKOUT_STORE_KEY,
  useActiveWorkoutStore,
  useLastSessionStore,
} from '@features/workout/store';
import { switchPersistScope } from '@infrastructure/storage';

/** Scope used while nobody is signed in. Holds nothing of value. */
export const SIGNED_OUT_SCOPE = 'signed-out';

/** Point every persisted user store at `uid` (or the signed-out scope). */
function applyUserScope(uid: string | null): void {
  const scope = uid ?? SIGNED_OUT_SCOPE;
  const adopt = uid !== null;
  switchPersistScope(useHistoryStore, HISTORY_STORE_KEY, scope, adopt);
  switchPersistScope(useRoutineStore, ROUTINES_STORE_KEY, scope, adopt);
  switchPersistScope(useActiveWorkoutStore, ACTIVE_WORKOUT_STORE_KEY, scope, adopt);
  switchPersistScope(usePreferencesStore, PREFERENCES_STORE_KEY, scope, adopt);
  // In-memory stores that can still hold the previous account's data.
  useLastSessionStore.setState(useLastSessionStore.getInitialState(), true);
  useHistoryFilterStore.setState(useHistoryFilterStore.getInitialState(), true);
}

let unsubscribe: (() => void) | null = null;

/**
 * Scope the stores to the current account and follow every later change.
 * Idempotent, so a fast-refresh remount is safe. Returns the unsubscriber.
 */
export function registerUserScope(): () => void {
  if (unsubscribe !== null) return unsubscribe;

  let currentUid = useAuthStore.getState().user?.uid ?? null;
  applyUserScope(currentUid);

  const stop = useAuthStore.subscribe((state) => {
    const nextUid = state.user?.uid ?? null;
    if (nextUid === currentUid) return;
    currentUid = nextUid;
    applyUserScope(nextUid);
  });
  unsubscribe = () => {
    stop();
    unsubscribe = null;
  };
  return unsubscribe;
}
