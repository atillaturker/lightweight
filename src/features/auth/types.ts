/**
 * Auth feature types.
 *
 * These describe the client-side view of the Firebase identity layer.
 * They intentionally mirror only what the UI needs — Firebase's own
 * `User` type never leaks past `services/`.
 */

/** Lifecycle state of the auth feature. */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

/** Provider IDs we accept from Firebase. Matches `providerData[].providerId`. */
export type AuthProvider = 'password' | 'google.com' | 'apple.com';

/** The signed-in user's minimal profile. */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: AuthProvider;
}

/** Store/selector shape for the auth state. */
export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
}

/** Payload for email/password account creation. */
export interface SignUpCredentials {
  email: string;
  password: string;
  displayName: string;
}

/** Payload for email/password sign-in. */
export interface SignInCredentials {
  email: string;
  password: string;
}
