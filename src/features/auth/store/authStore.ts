/**
 * Auth client state.
 *
 * Only the user profile is persisted to MMKV. `status` and `error` are
 * transient: a cold start always begins from `idle` with no error, and the
 * durable session is restored by Firebase's own persistence, not by this store.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@infrastructure/storage';

import type { AuthState, AuthStatus, AuthUser } from '../types';

/** Auth store state plus the mutators used by hooks and screens. */
export interface AuthStore extends AuthState {
  /** Set the lifecycle status. */
  setStatus: (status: AuthStatus) => void;
  /** Set or clear the signed-in user. */
  setUser: (user: AuthUser | null) => void;
  /** Set or clear the current error message. */
  setError: (error: string | null) => void;
  /** Return the store to its initial, signed-out state. */
  reset: () => void;
}

/** Initial transient state — everything is unset until auth resolves. */
const INITIAL_STATE: AuthState = {
  status: 'idle',
  user: null,
  error: null,
};

/**
 * Persisted auth store. Subscribe with a selector, e.g.
 * `useAuthStore((s) => s.user)`.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setStatus: (status) => set({ status }),
      setUser: (user) => set({ user }),
      setError: (error) => set({ error }),
      reset: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.status = 'idle';
      },
    },
  ),
);
