/**
 * UNUSED — kept for reference and for tests that want to drive the root
 * navigator without a live Firebase session.
 *
 * This was the temporary auth-state stub that the root navigator consumed
 * before the real auth feature existed. `RootNavigator` now reads state
 * from `@features/auth` (`useAuth` plus the `hasOnboarded` selector), so
 * nothing in the app imports this module any more.
 *
 * Do not delete without checking that no test harness depends on it.
 *
 * Historical usage notes, still accurate for manual testing:
 *   - To test the Onboarding flow: return `hasOnboarded: false`.
 *   - To test the Main flow: return `isAuthenticated: true`.
 *   - To test the Auth flow: return `isAuthenticated: false`.
 */
export interface AuthState {
  /** Whether a session exists. */
  isAuthenticated: boolean;
  /** Whether the first-run flow has been completed. */
  hasOnboarded: boolean;
  /** Whether the persisted session is still being restored. */
  isLoading: boolean;
}

/**
 * Returns a hardcoded auth state. Unused by the app — see the module
 * comment above. Kept so a stub implementation remains available.
 */
export function useAuthState(): AuthState {
  return {
    isAuthenticated: false,
    hasOnboarded: false,
    isLoading: false,
  };
}
