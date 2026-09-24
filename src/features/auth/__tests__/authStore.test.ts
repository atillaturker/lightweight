/**
 * Tests for the auth store: state transitions and persist boundaries.
 */

// In-memory MMKV double. Populated by the store's persist middleware, so
// tests can assert exactly what was written to disk.
const mockMemory = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => {
      mockMemory.set(key, value);
    },
    remove: (key: string) => {
      mockMemory.delete(key);
    },
  }),
}));

// The store itself does not touch Firebase, but the feature barrel does.
// Mocking keeps this suite independent of the native Firebase SDK.
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => {}),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn() },
  OAuthProvider: class {
    credential = jest.fn();
  },
  signInWithCredential: jest.fn(),
}));

jest.mock('@/services/firebase/config', () => ({ auth: {}, db: {} }));

import { useAuthStore } from '../store/authStore';
import type { AuthUser } from '../types';

const TEST_USER: AuthUser = {
  uid: 'uid-1',
  email: 'lifter@example.com',
  displayName: 'Lifter',
  photoURL: null,
  provider: 'password',
};

/** Read and parse the persisted `auth` payload, or `null` when absent. */
function readPersistedAuth(): { state: Record<string, unknown> } | null {
  const raw = mockMemory.get('auth');
  if (!raw) return null;
  return JSON.parse(raw) as { state: Record<string, unknown> };
}

beforeEach(() => {
  mockMemory.clear();
  useAuthStore.setState({ status: 'idle', user: null, error: null });
});

describe('authStore', () => {
  it('starts with status idle and no user', () => {
    const state = useAuthStore.getState();
    expect(state.status).toBe('idle');
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
  });

  it('setUser updates the user', () => {
    useAuthStore.getState().setUser(TEST_USER);
    expect(useAuthStore.getState().user).toEqual(TEST_USER);
  });

  it('setError updates the error and status', () => {
    useAuthStore.getState().setError('Incorrect password.');
    useAuthStore.getState().setStatus('error');

    const state = useAuthStore.getState();
    expect(state.error).toBe('Incorrect password.');
    expect(state.status).toBe('error');
  });

  it('reset clears user, error, and status', () => {
    useAuthStore.getState().setUser(TEST_USER);
    useAuthStore.getState().setError('boom');
    useAuthStore.getState().setStatus('error');

    useAuthStore.getState().reset();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
    expect(state.status).toBe('idle');
  });

  it('persists only the user, never status or error', () => {
    useAuthStore.getState().setUser(TEST_USER);
    useAuthStore.getState().setStatus('error');
    useAuthStore.getState().setError('something went wrong');

    const persisted = readPersistedAuth();
    expect(persisted).not.toBeNull();
    expect(persisted?.state).toEqual({ user: TEST_USER });
    expect(persisted?.state).not.toHaveProperty('status');
    expect(persisted?.state).not.toHaveProperty('error');
  });
});
