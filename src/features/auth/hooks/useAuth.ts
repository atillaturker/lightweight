/**
 * Read-only auth state hook.
 *
 * Hydrates the auth store from Firebase on mount, keeps it in sync with
 * Firebase auth changes, and configures Google Sign-In once.
 */
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { configureGoogleSignIn, subscribeToAuthChanges } from '../services';
import { useAuthStore } from '../store';
import type { AuthStatus, AuthUser } from '../types';

/** Values returned by {@link useAuth}. */
export interface UseAuthResult {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Subscribe to auth state and expose derived flags.
 *
 * Mount this once per screen that needs auth state; the underlying Firebase
 * subscription is reference-counted, so unmounting one consumer does not
 * disturb the others.
 */
export function useAuth(): UseAuthResult {
  const { user, status } = useAuthStore(
    useShallow((state) => ({ user: state.user, status: state.status })),
  );
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    configureGoogleSignIn();
    return subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
    });
  }, [setUser]);

  return {
    user,
    status,
    isAuthenticated: user !== null,
    isLoading: status === 'loading',
  };
}
