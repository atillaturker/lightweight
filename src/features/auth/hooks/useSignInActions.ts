/**
 * Write-side auth hook.
 *
 * Every action owns its own status/error bookkeeping and never throws to the
 * caller — failures land in the store so screens can render inline errors.
 */
import { useCallback } from 'react';

import {
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOut as signOutFirebase,
  signUpWithEmail,
  signOutGoogle,
} from '../services';
import { useAuthStore } from '../store';
import type { AuthUser, SignInCredentials, SignUpCredentials } from '../types';

/** Actions returned by {@link useSignInActions}. */
export interface SignInActions {
  signInEmail: (credentials: SignInCredentials) => Promise<void>;
  signUpEmail: (credentials: SignUpCredentials) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

/** Extract a displayable message from an unknown thrown value. */
function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

/**
 * Auth mutations bound to the store.
 *
 * Each action resolves after the store has been updated, so callers can
 * `await` and then navigate without racing the state change.
 */
export function useSignInActions(): SignInActions {
  const setStatus = useAuthStore((state) => state.setStatus);
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);
  const reset = useAuthStore((state) => state.reset);

  /**
   * Shared success/failure envelope for every credential exchange:
   * loading first, then either the user or a message.
   */
  const runAuthAction = useCallback(
    async (action: () => Promise<AuthUser>): Promise<void> => {
      setError(null);
      setStatus('loading');
      try {
        const user = await action();
        setUser(user);
        setStatus('authenticated');
        setError(null);
      } catch (error: unknown) {
        setUser(null);
        setError(toMessage(error));
        setStatus('error');
      }
    },
    [setError, setStatus, setUser],
  );

  const signInEmail = useCallback(
    (credentials: SignInCredentials) =>
      runAuthAction(() => signInWithEmail(credentials)),
    [runAuthAction],
  );

  const signUpEmail = useCallback(
    (credentials: SignUpCredentials) =>
      runAuthAction(() => signUpWithEmail(credentials)),
    [runAuthAction],
  );

  const signInGoogle = useCallback(() => runAuthAction(signInWithGoogle), [runAuthAction]);

  const signInApple = useCallback(() => runAuthAction(signInWithApple), [runAuthAction]);

  const signOut = useCallback(async (): Promise<void> => {
    setStatus('loading');
    try {
      await signOutGoogle();
      await signOutFirebase();
      reset();
    } catch (error: unknown) {
      setError(toMessage(error));
      setStatus('error');
    }
  }, [reset, setError, setStatus]);

  return { signInEmail, signUpEmail, signInGoogle, signInApple, signOut };
}
