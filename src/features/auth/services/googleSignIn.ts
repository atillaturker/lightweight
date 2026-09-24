/**
 * Google Sign-In wrapper for the auth feature.
 *
 * Bridges `@react-native-google-signin/google-signin` to Firebase Auth and
 * returns the feature's own `AuthUser` shape.
 */
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, type UserCredential } from 'firebase/auth';

import { auth } from '@/services/firebase/config';
import type { AuthUser } from '../types';
import { normalizeAuthError, toAuthUser } from './authService';

let isConfigured = false;

/**
 * Configure the Google Sign-In SDK once per app session.
 *
 * Reads the web client ID from `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. When the
 * variable is missing the configuration is skipped with a warning — the SDK
 * stays unconfigured and `signInWithGoogle` will surface a clear error.
 */
export function configureGoogleSignIn(): void {
  if (isConfigured) return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    console.warn(
      'Google Sign-In is not configured: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing.',
    );
    return;
  }

  GoogleSignin.configure({ webClientId, offlineAccess: true });
  isConfigured = true;
}

/** Translate a Google SDK error into a message safe to show the user. */
function describeGoogleError(error: unknown): Error {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.IN_PROGRESS:
        return new Error('A sign-in operation is already in progress.');
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return new Error('Google Play Services is not available or outdated.');
      case statusCodes.SIGN_IN_REQUIRED:
        return new Error('Google Sign-In needs to be started again.');
      default:
        return new Error('Google Sign-In failed. Please try again.');
    }
  }
  return normalizeAuthError(error);
}

/**
 * Run the Google sign-in flow and exchange the ID token for a Firebase session.
 *
 * Throws a normalized `Error` with user-facing copy on failure.
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    configureGoogleSignIn();

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      throw new Error('Google Sign-In was cancelled.');
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      throw new Error('Google Sign-In did not return an ID token.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential: UserCredential = await signInWithCredential(auth, credential);
    return toAuthUser(userCredential.user);
  } catch (error: unknown) {
    throw describeGoogleError(error);
  }
}

/** Clear the cached Google session. Safe to call when no session exists. */
export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // No cached Google session, or the SDK refused the call. The Firebase
    // sign-out is what actually ends the session, so this is a soft failure.
  }
}
