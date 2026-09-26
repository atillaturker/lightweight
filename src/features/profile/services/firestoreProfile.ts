/**
 * Firestore reads and writes for the `users/{uid}` profile document.
 *
 * Owns onboarding state and the user's training preferences. Shape
 * validation lives in the pure companion module so it can be tested without
 * the Firebase SDK. Every write merges into the existing document and
 * stamps `updatedAt`.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';

import type { UserPreferences } from '@domain/entities';
import { db } from '@/services/firebase/config';

import { parseUserProfile, type UserProfileDocument } from './userProfileDocument';

/** Input accepted by {@link createUserProfile}. */
export interface NewUserProfile {
  hasOnboarded: boolean;
  preferences: UserPreferences;
}

/**
 * Reject an empty uid loudly.
 *
 * Every profile operation is scoped to a signed-in user. A silent no-op
 * here would drop the write with nothing in the logs to explain why, which
 * is exactly how the Firestore document went missing before.
 */
function requireUid(uid: string): string {
  if (uid.trim() === '') {
    throw new Error('A signed-in uid is required for the profile document');
  }
  return uid;
}

/** Reference to the signed-in user's profile document. */
function profileDocRef(uid: string) {
  return doc(db, 'users', requireUid(uid));
}

/**
 * Read and validate the profile document.
 *
 * Returns `null` when the document does not exist or fails validation, so
 * callers fall back to their local state instead of crashing.
 */
export async function fetchUserProfile(
  uid: string,
): Promise<UserProfileDocument | null> {
  const snapshot = await getDoc(profileDocRef(uid));
  if (!snapshot.exists()) return null;
  return parseUserProfile(snapshot.data());
}

/**
 * Create the profile document for a user who does not have one yet.
 *
 * Called unconditionally on sign-in when the read reports no document, so
 * an account created before the profile document existed still gets one
 * within seconds rather than waiting on a preference change.
 */
export async function createUserProfile(
  uid: string,
  profile: NewUserProfile,
): Promise<void> {
  const now = Date.now();
  await setDoc(profileDocRef(uid), {
    hasOnboarded: profile.hasOnboarded,
    preferences: profile.preferences,
    createdAt: now,
    updatedAt: now,
  });
}

/** Merge the user's preferences into the profile document. */
export async function saveUserPreferences(
  uid: string,
  preferences: UserPreferences,
): Promise<void> {
  await setDoc(
    profileDocRef(uid),
    { preferences, updatedAt: Date.now() },
    { merge: true },
  );
}

/** Merge the onboarding flag into the profile document. */
export async function saveHasOnboarded(
  uid: string,
  hasOnboarded: boolean,
): Promise<void> {
  await setDoc(
    profileDocRef(uid),
    { hasOnboarded, updatedAt: Date.now() },
    { merge: true },
  );
}
