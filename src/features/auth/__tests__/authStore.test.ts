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

// The sign-out path is exercised through `useSignInActions`, which reaches
// the native Google SDK and the Firebase session. Both are replaced by
// resolvable doubles so the test observes only the store bookkeeping.
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockSignOutGoogle = jest.fn().mockResolvedValue(undefined);

jest.mock('../services', () => ({
  signOut: () => mockSignOut(),
  signOutGoogle: () => mockSignOutGoogle(),
  signInWithApple: jest.fn(),
  signInWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
  signUpWithEmail: jest.fn(),
}));

import { act, renderHook } from '@testing-library/react-native';

import { useSignInActions } from '../hooks/useSignInActions';
import { useAuthStore } from '../store/authStore';
import type { AuthUser } from '../types';

const TEST_USER: AuthUser = {
  uid: 'uid-1',
  email: 'lifter@example.com',
  displayName: 'Lifter',
  photoURL: null,
  provider: 'password',
  hasOnboarded: false,
};

/** Read and parse the persisted `auth` payload, or `null` when absent. */
function readPersistedAuth(): { state: Record<string, unknown> } | null {
  const raw = mockMemory.get('auth');
  if (!raw) return null;
  return JSON.parse(raw) as { state: Record<string, unknown> };
}

beforeEach(() => {
  mockMemory.clear();
  jest.clearAllMocks();
  mockSignOut.mockResolvedValue(undefined);
  mockSignOutGoogle.mockResolvedValue(undefined);
  useAuthStore.setState({
    status: 'idle',
    user: null,
    error: null,
    bootstrapped: false,
  });
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

  it('reset keeps bootstrapped true so the root navigator stops spinning', () => {
    useAuthStore.getState().setUser(TEST_USER);
    expect(useAuthStore.getState().bootstrapped).toBe(true);

    useAuthStore.getState().reset();

    // `bootstrapped` describes the launch, not the session. Clearing it here
    // sends RootNavigator back to the cold-start spinner with no pending
    // Firebase emission left to resolve it — the reported stuck sign-out.
    expect(useAuthStore.getState().bootstrapped).toBe(true);
  });

  it('persists the user and the onboarded uid record, never status or error', () => {
    useAuthStore.getState().setUser(TEST_USER);
    useAuthStore.getState().setStatus('error');
    useAuthStore.getState().setError('something went wrong');

    const persisted = readPersistedAuth();
    expect(persisted).not.toBeNull();
    expect(persisted?.state).toEqual({ user: TEST_USER, onboardedUids: [] });
    expect(persisted?.state).not.toHaveProperty('status');
    expect(persisted?.state).not.toHaveProperty('error');
    expect(persisted?.state).not.toHaveProperty('bootstrapped');
  });
});

describe('onboarding persistence', () => {
  it('signals onboarding for a uid that is not in the record', () => {
    useAuthStore.getState().setUser(TEST_USER);

    expect(useAuthStore.getState().user?.hasOnboarded).toBe(false);
  });

  it('records the signed-in uid when onboarding completes', () => {
    useAuthStore.getState().setUser(TEST_USER);

    useAuthStore.getState().completeOnboarding();

    expect(useAuthStore.getState().user?.hasOnboarded).toBe(true);
    expect(useAuthStore.getState().onboardedUids).toEqual([TEST_USER.uid]);
    expect(readPersistedAuth()?.state.onboardedUids).toEqual([TEST_USER.uid]);
  });

  it('survives a sign-out: reset keeps the onboarded uid record', () => {
    useAuthStore.getState().setUser(TEST_USER);
    useAuthStore.getState().completeOnboarding();

    useAuthStore.getState().reset();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().onboardedUids).toEqual([TEST_USER.uid]);
    // The record is what a later cold start restores from, so it must still
    // be on disk after the reset that a sign-out performs.
    expect(readPersistedAuth()?.state.onboardedUids).toEqual([TEST_USER.uid]);
  });

  it('restores the flag from the record when Firebase emits the user again', () => {
    useAuthStore.getState().setUser(TEST_USER);
    useAuthStore.getState().completeOnboarding();
    useAuthStore.getState().reset();

    // A cold start: Firebase re-emits a user object with no onboarding
    // answer attached. Only the persisted record can answer for it.
    useAuthStore.getState().setUser({ ...TEST_USER, hasOnboarded: false });

    expect(useAuthStore.getState().user?.hasOnboarded).toBe(true);
  });

  it('restores the flag after a full rehydrate, as on a cold start', async () => {
    useAuthStore.getState().setUser(TEST_USER);
    useAuthStore.getState().completeOnboarding();

    // What a completed session leaves on disk.
    const onDisk = mockMemory.get('auth');
    expect(onDisk).toContain(TEST_USER.uid);

    // Cold start: in-memory state is rebuilt from that snapshot alone.
    useAuthStore.setState({
      onboardedUids: [],
      user: null,
      status: 'idle',
      bootstrapped: false,
    });
    mockMemory.set('auth', onDisk as string);
    await act(async () => {
      await useAuthStore.persist.rehydrate();
    });

    expect(useAuthStore.getState().onboardedUids).toEqual([TEST_USER.uid]);
    expect(useAuthStore.getState().user?.hasOnboarded).toBe(true);
  });

  it('does not trust a restored flag the record does not vouch for', async () => {
    // A snapshot from another account, or one written before the record
    // existed. The in-memory record is the authority on a cold start.
    // Clear in-memory state first (which itself writes to storage), then
    // plant the snapshot a previous launch left behind.
    useAuthStore.setState({ user: null, onboardedUids: [], bootstrapped: false });
    mockMemory.set(
      'auth',
      JSON.stringify({
        state: {
          user: { ...TEST_USER, uid: 'uid-other', hasOnboarded: true },
          onboardedUids: [TEST_USER.uid],
        },
        version: 0,
      }),
    );


    await act(async () => {
      await useAuthStore.persist.rehydrate();
    });

    expect(useAuthStore.getState().user?.uid).toBe('uid-other');
    expect(useAuthStore.getState().user?.hasOnboarded).toBe(false);
  });

  it('keeps per-account answers independent on one device', () => {
    const other = { ...TEST_USER, uid: 'uid-2' };

    useAuthStore.getState().setUser(TEST_USER);
    useAuthStore.getState().completeOnboarding();
    useAuthStore.getState().reset();

    useAuthStore.getState().setUser(other);
    expect(useAuthStore.getState().user?.hasOnboarded).toBe(false);

    useAuthStore.getState().completeOnboarding();
    expect(useAuthStore.getState().onboardedUids).toEqual(['uid-1', 'uid-2']);
  });
});

describe('auth sign-out', () => {
  it('ends signed out with a settled launch after an authenticated session', async () => {
    useAuthStore.getState().setUser({ ...TEST_USER, hasOnboarded: true });
    useAuthStore.getState().setStatus('authenticated');

    const { result } = renderHook(() => useSignInActions());
    await act(async () => {
      await result.current.signOut();
    });

    const state = useAuthStore.getState();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(state.user).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    // The guard that regressed: RootNavigator must not fall back to the
    // bootstrap spinner after a sign-out.
    expect(state.bootstrapped).toBe(true);
  });

  it('survives repeated sign-in to sign-out cycles', async () => {
    const { result } = renderHook(() => useSignInActions());

    /** Seed an authenticated session for `uid`, then sign it out. */
    const signInThenOut = async (uid: string): Promise<void> => {
      useAuthStore.getState().setUser({
        ...TEST_USER,
        uid,
        hasOnboarded: true,
      });
      useAuthStore.getState().setStatus('authenticated');

      await act(async () => {
        await result.current.signOut();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.bootstrapped).toBe(true);
    };

    await signInThenOut('uid-a');
    await signInThenOut('uid-b');
    await signInThenOut('uid-c');

    expect(mockSignOut).toHaveBeenCalledTimes(3);
  });
});
