/**
 * Public surface of the auth feature.
 *
 * Apps and other features should import from here rather than reaching into
 * `store/`, `services/`, or `hooks/` directly.
 */
export type {
  AuthProvider,
  AuthState,
  AuthStatus,
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
} from './types';

export { useAuthStore } from './store';
export type { AuthStore } from './store';


export { useAuth, useSignInActions } from './hooks';
export type { SignInActions, UseAuthResult } from './hooks';

export { LogInScreen, SignUpScreen } from './screens';

export {
  AppleGlyph,
  AuthDivider,
  EyeIcon,
  GoogleGlyph,
  PasswordStrengthBar,
  TermsCheckbox,
} from './components';
export type {
  PasswordStrengthBarProps,
  TermsCheckboxProps,
} from './components';

export { calculatePasswordStrength } from './utils/passwordStrength';

export {
  configureGoogleSignIn,
  getCurrentUser,
  isAppleSignInAvailable,
  normalizeAuthError,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signOutGoogle,
  signUpWithEmail,
  subscribeToAuthChanges,
  toAuthUser,
} from './services';
