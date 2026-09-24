/**
 * Apple Sign-In wrapper for the auth feature.
 *
 * Bridges `expo-apple-authentication` to Firebase Auth. Apple Sign-In is an
 * iOS-only capability; on other platforms the entry points fail loudly rather
 * than silently doing nothing.
 */
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, signInWithCredential, type UserCredential } from 'firebase/auth';

import { auth } from '@/services/firebase/config';
import type { AuthUser } from '../types';
import { normalizeAuthError, toAuthUser } from './authService';

/** Error thrown when Apple Sign-In is requested on a non-iOS platform. */
const UNSUPPORTED_MESSAGE = 'Apple Sign-In is not available on this platform.';

/** Firebase provider instance for Apple. Stateless, so one instance is safe. */
const appleProvider = new OAuthProvider('apple.com');

/**
 * Whether Apple Sign-In can be used on the current device.
 *
 * Resolves `false` on non-iOS platforms without touching the native module.
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Format the one-time Apple name payload into a display name.
 *
 * Apple only returns the user's name on the very first authorization, so this
 * is called at most once per install. Returns `null` when nothing usable came
 * back.
 */
function formatDisplayName(fullName: AppleAuthentication.AppleAuthenticationFullName | null): string | null {
  if (!fullName) return null;
  const name = AppleAuthentication.formatFullName(fullName);
  return name.trim().length > 0 ? name : null;
}

/**
 * Run the Apple sign-in flow and exchange the identity token for a Firebase
 * session.
 *
 * Throws an `Error` reading
 * "Apple Sign-In is not available on this platform." off iOS.
 */
export async function signInWithApple(): Promise<AuthUser> {
  if (Platform.OS !== 'ios') {
    throw new Error(UNSUPPORTED_MESSAGE);
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const identityToken = credential.identityToken;
    if (!identityToken) {
      throw new Error('Apple Sign-In did not return an identity token.');
    }

    const firebaseCredential = appleProvider.credential({ idToken: identityToken });
    const userCredential: UserCredential = await signInWithCredential(auth, firebaseCredential);

    const displayName = formatDisplayName(credential.fullName);
    if (displayName && !userCredential.user.displayName) {
      return { ...toAuthUser(userCredential.user), displayName };
    }
    return toAuthUser(userCredential.user);
  } catch (error: unknown) {
    throw normalizeAuthError(error);
  }
}
