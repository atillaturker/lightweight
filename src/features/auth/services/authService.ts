/**
 * Firebase Auth wrapper for the auth feature.
 *
 * Every function here speaks the feature's own `AuthUser` shape; nothing
 * outside this module should import from `firebase/auth` directly.
 */
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type AuthError,
  type User,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/services/firebase/config';
import type { AuthProvider, AuthUser, SignInCredentials, SignUpCredentials } from '../types';

/** Firebase error codes we translate into user-facing copy. */
const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': "That email doesn't look right.",
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/network-request-failed': 'Check your connection and try again.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/** Type guard for Firebase's `AuthError` (which carries a `code`). */
function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

/** Type guard for errors already normalized by this module or a sibling service. */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Normalize any thrown value into an `Error` with human-readable copy.
 *
 * Unknown error shapes still produce an `Error`, so callers never have to
 * handle the raw `unknown`.
 */
export function normalizeAuthError(error: unknown): Error {
  if (isAuthError(error)) {
    return new Error(ERROR_MESSAGES[error.code] ?? FALLBACK_MESSAGE);
  }
  if (isError(error)) {
    // Services such as googleSignIn already throw messages for humans.
    if (error.message.startsWith('auth/')) return new Error(FALLBACK_MESSAGE);
    return new Error(error.message || FALLBACK_MESSAGE);
  }
  return new Error(FALLBACK_MESSAGE);
}

/** Read the primary provider ID from a Firebase user, defaulting to password. */
function resolveProvider(user: User): AuthProvider {
  const providerId = user.providerData[0]?.providerId;
  if (providerId === 'google.com' || providerId === 'apple.com') return providerId;
  return 'password';
}

/**
 * Project a Firebase `User` onto the feature's `AuthUser` shape.
 *
 * Exported so the Google and Apple services can reuse it without
 * duplicating provider-resolution logic.
 */
export function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider: resolveProvider(user),
  };
}

/** Create an email/password account and set the display name on the profile. */
export async function signUpWithEmail(credentials: SignUpCredentials): Promise<AuthUser> {
  try {
    const credential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password,
    );
    await updateProfile(credential.user, { displayName: credentials.displayName });
    return toAuthUser(credential.user);
  } catch (error: unknown) {
    throw normalizeAuthError(error);
  }
}

/** Sign in with an existing email/password account. */
export async function signInWithEmail(credentials: SignInCredentials): Promise<AuthUser> {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password,
    );
    return toAuthUser(credential.user);
  } catch (error: unknown) {
    throw normalizeAuthError(error);
  }
}

/** End the Firebase session. */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    throw normalizeAuthError(error);
  }
}

/** Snapshot of the currently signed-in user, or `null` when signed out. */
export function getCurrentUser(): AuthUser | null {
  const user = auth.currentUser;
  return user ? toAuthUser(user) : null;
}

/**
 * Subscribe to Firebase auth-state changes.
 *
 * Calls `cb` immediately with the current user, then on every change.
 * Returns an unsubscribe function.
 */
export function subscribeToAuthChanges(cb: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    cb(user ? toAuthUser(user) : null);
  });
}
