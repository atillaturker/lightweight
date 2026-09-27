/**
 * Jest stand-in for the Google Sign-In native module. Used by any test that
 * does not declare its own `jest.mock`.
 */
export const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn(async () => true),
  signIn: jest.fn(),
  signOut: jest.fn(async () => undefined),
};

export const statusCodes = {
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
};

export const isErrorWithCode = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error;

export const isSuccessResponse = (response: { type?: string }): boolean =>
  response.type === 'success';
