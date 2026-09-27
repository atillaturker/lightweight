/**
 * Sign-in synchronisation between the local stores and Firestore.
 *
 * Foundation policy, deliberately simple:
 * - One-shot read on sign-in.
 * - One-shot re-read when the app returns to the foreground, but only if
 *   the last sync was more than five minutes ago.
 * - No real-time listeners in this batch.
 *
 * Workouts are merged into the local history store with local winning on
 * id conflicts. Preferences are resolved by `resolvePreferences`; the
 * onboarding flag is adopted from the cloud when the cloud has it and the
 * device does not.
 */
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import type { UserPreferences } from '@domain/entities';
import { useAuthStore } from '@features/auth/store';
import { reconcileSessions } from '@features/history/services';
import {
  fetchWorkoutsFromFirestore,
  type RemoteHistory,
} from '@features/history/services/firestoreWorkouts';
import { useHistoryStore } from '@features/history/store';
import { DEFAULT_PREFERENCES, usePreferencesStore } from '@features/profile/store';
import { resolvePreferences } from '@features/profile/services';
import type { UserProfileDocument } from '@features/profile/services';
import {
  createUserProfile,
  fetchUserProfile,
  saveHasOnboarded,
  saveUserPreferences,
} from '@features/profile/services/firestoreProfile';

import { pendingWorkoutIds, queueWorkoutUploads, resumeQueue } from './cloudSync';

/** Preferences still to be pushed, debounced by this much. */
const PREFERENCES_DEBOUNCE_MS = 500;

/** Foreground re-sync is skipped if the last sync is newer than this. */
const RESYNC_WINDOW_MS = 5 * 60 * 1000;

/** Timestamp of the last completed sign-in sync, in epoch ms. */
let lastSyncedAt = 0;

/** The five persisted preference fields, without the store's setters. */
function pickPreferences(store: UserPreferences): UserPreferences {
  return {
    unit: store.unit,
    weekStart: store.weekStart,
    rpeEnabled: store.rpeEnabled,
    restTimerSeconds: store.restTimerSeconds,
    notificationsEnabled: store.notificationsEnabled,
  };
}

/**
 * Whether `uid` is still the signed-in account. A read that resolves after
 * a sign-out or account switch must not write into the new account's
 * stores, which are already scoped to someone else.
 */
function isStillSignedIn(uid: string): boolean {
  return useAuthStore.getState().user?.uid === uid;
}

/** Read the profile document, tolerating a missing or unreadable one. */
async function readProfile(uid: string): Promise<UserProfileDocument | null> {
  try {
    return await fetchUserProfile(uid);
  } catch (error: unknown) {
    console.warn('[firestore] failed to read user profile', error);
    return null;
  }
}

/**
 * Pull the profile document and workout history, then merge both.
 *
 * When no profile document exists yet (an account created before the
 * document was introduced, or a fresh install), it is created here with the
 * device's current preferences and onboarding flag. This is the write that
 * guarantees `users/{uid}` appears on sign-in.
 */
async function syncOnSignIn(uid: string): Promise<void> {
  const localPreferences = pickPreferences(usePreferencesStore.getState());
  const localOnboarded = useAuthStore.getState().user?.hasOnboarded ?? false;
  const profile = await readProfile(uid);
  if (!isStillSignedIn(uid)) return;

  if (profile === null) {
    try {
      await createUserProfile(uid, {
        hasOnboarded: localOnboarded,
        preferences: localPreferences,
      });
    } catch (error: unknown) {
      console.warn('[firestore] failed to create user profile', error);
    }
  } else {
    if (profile.hasOnboarded && !localOnboarded) {
      useAuthStore.getState().completeOnboarding();
    }

    const merge = resolvePreferences(
      localPreferences,
      profile.preferences,
      DEFAULT_PREFERENCES,
    );
    if (merge.pushLocal) {
      void saveUserPreferences(uid, merge.preferences).catch((error: unknown) => {
        console.warn('[firestore] failed to push preferences', error);
      });
    } else {
      usePreferencesStore.setState(merge.preferences);
    }
  }

  const remote = await readRemoteHistory(uid);
  if (!isStillSignedIn(uid)) return;
  if (remote !== null) reconcileHistory(uid, remote);
  lastSyncedAt = Date.now();
  // Deliver anything this account left queued, including parked writes.
  resumeQueue();
}

/** Read the cloud history, or `null` when the read failed. */
async function readRemoteHistory(uid: string): Promise<RemoteHistory | null> {
  try {
    return await fetchWorkoutsFromFirestore(uid);
  } catch (error: unknown) {
    // Reconciling against nothing would re-upload the whole history.
    console.warn('[firestore] failed to read workouts', error);
    return null;
  }
}

/**
 * Apply a cloud read to local history and queue what the cloud is missing.
 * Queued mutations count as already done: a queued delete must not be
 * undone by the read, and a queued save must not be queued twice.
 */
function reconcileHistory(uid: string, remote: RemoteHistory): void {
  const pending = pendingWorkoutIds(uid);
  const result = reconcileSessions(useHistoryStore.getState().sessions, {
    ...remote,
    deletedIds: [...remote.deletedIds, ...pending.deletes],
  });
  useHistoryStore.setState({ sessions: result.sessions });
  queueWorkoutUploads(
    uid,
    result.toUpload.filter((workout) => !pending.saves.has(workout.id)),
  );
}

/**
 * Run the cloud synchronisation loop. Mount once at the app root; it is
 * inert while signed out.
 */
export function useCloudSync(): void {
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const hasOnboarded = useAuthStore((state) => state.user?.hasOnboarded ?? false);

  const preferences = usePreferencesStore(
    useShallow(pickPreferences),
  );

  // The uid whose initial read has finished. Until then, pushes are held
  // back so a slow read cannot be clobbered by the local defaults being
  // written up on mount.
  const [syncedUid, setSyncedUid] = useState<string | null>(null);

  // One-shot read whenever a new user becomes current.
  useEffect(() => {
    if (!bootstrapped || uid === null) {
      setSyncedUid(null);
      return;
    }
    let cancelled = false;
    void syncOnSignIn(uid)
      .then(() => {
        if (!cancelled) setSyncedUid(uid);
      })
      .catch((error: unknown) => {
        console.warn('[firestore] sign-in sync failed', error);
      });
    return () => {
      cancelled = true;
    };
  }, [bootstrapped, uid]);

  // Re-read when the app returns to the foreground after the quiet window.
  useEffect(() => {
    if (uid === null) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      if (Date.now() - lastSyncedAt < RESYNC_WINDOW_MS) return;
      void syncOnSignIn(uid);
    });
    return () => subscription.remove();
  }, [uid]);

  // Push preference changes, debounced, once the initial read has settled.
  useEffect(() => {
    if (uid === null || syncedUid !== uid) return;
    const timer = setTimeout(() => {
      void saveUserPreferences(uid, preferences).catch((error: unknown) => {
        console.warn('[firestore] failed to save preferences', error);
      });
    }, PREFERENCES_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [uid, syncedUid, preferences]);

  // Push the onboarding flag once it flips true and sync has settled.
  useEffect(() => {
    if (uid === null || syncedUid !== uid || !hasOnboarded) return;
    void saveHasOnboarded(uid, true).catch((error: unknown) => {
      console.warn('[firestore] failed to save onboarding flag', error);
    });
  }, [uid, syncedUid, hasOnboarded]);
}

/**
 * Renders nothing; exists so the sync hook can be mounted from the
 * composition root without wrapping the navigator.
 */
export function CloudSync(): null {
  useCloudSync();
  return null;
}
