import * as SecureStore from 'expo-secure-store';

/** Secure-store key under which the Firebase auth token is kept. */
export const AUTH_TOKEN_KEY = 'auth:token';

/**
 * Persist the Firebase auth token in the platform keychain.
 *
 * Failures are swallowed — callers must not crash because a keychain write
 * was refused.
 */
export async function saveAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch {
    // Keychain unavailable or write rejected; treated as a soft failure.
  }
}

/**
 * Read the stored Firebase auth token.
 *
 * Never throws: any read failure (missing key, keychain error, corrupt value)
 * resolves to `null`.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return token ?? null;
  } catch {
    return null;
  }
}

/**
 * Remove the stored Firebase auth token.
 *
 * Failures are swallowed — a stale token is preferable to a crashed sign-out.
 */
export async function clearAuthToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch {
    // Nothing to clear or keychain unavailable.
  }
}
