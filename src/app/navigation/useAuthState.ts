/**
 * TEMPORARY auth state stub.
 *
 * The real implementation (`features/auth/store`) does not exist yet and
 * lands in Task 10. Until then this returns hardcoded values so the root
 * navigator can switch between stacks during development.
 *
 * To test the Onboarding flow: set `hasOnboarded` to false.
 * To test the Main flow: set `isAuthenticated` to true.
 * To test the Auth flow: set `isAuthenticated` to false.
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
 * Returns the current auth state. Replace the body with the real auth
 * store selector in Task 10 — the return shape stays the same.
 */
export function useAuthState(): AuthState {
  return {
    isAuthenticated: true,
    hasOnboarded: true,
    isLoading: false,
  };
}
