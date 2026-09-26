/**
 * Auth client state.
 *
 * Two things are persisted to MMKV: the user profile and a separate
 * device-local record of which uids have finished first-run onboarding.
 * `status` and `error` are transient: a cold start always begins from
 * `idle` with no error, and the durable session is restored by Firebase's
 * own persistence, not by this store.
 *
 * `hasOnboarded` is stored twice on purpose. The copy on `user` is what the
 * UI reads, but Firebase is the only writer of `user` and it knows nothing
 * about onboarding — so on every cold start a fresh `user` object arrives
 * and must be given a value from somewhere that outlives the session. That
 * somewhere is `onboardedUids`, which `reset()` (sign-out) never clears.
 * Keeping the record outside `user` is what makes it survive sign-out.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@infrastructure/storage';

import type { AuthState, AuthStatus, AuthUser } from '../types';
import { isOnboarded, markOnboarded } from '../utils/onboardedUids';


/** Auth store state plus the mutators used by hooks and screens. */
export interface AuthStore extends AuthState {
  /**
   * Whether the initial auth resolution has finished. False on cold start
   * until Firebase reports the persisted session (or its absence), true
   * afterwards. Never persisted — it is a per-launch fact.
   *
   * Once true it stays true for the rest of the launch, including across
   * sign-out: auth has resolved, so there is nothing left to wait for.
   */
  bootstrapped: boolean;
  /**
   * Uids that have completed first-run onboarding on this device.
   *
   * Persisted and deliberately NOT cleared by {@link AuthStore.reset}, so a
   * sign-out followed by a sign-in restores the flag instead of replaying
   * setup. Keyed by uid so two accounts on one device stay independent.
   */
  onboardedUids: string[];
  /** Set the lifecycle status. */
  setStatus: (status: AuthStatus) => void;
  /** Set or clear the signed-in user. */
  setUser: (user: AuthUser | null) => void;
  /** Set or clear the current error message. */
  setError: (error: string | null) => void;
  /** Return the store to its initial, signed-out state. */
  reset: () => void;
  /** Mark the signed-in user as having completed first-run onboarding. */
  completeOnboarding: () => void;
}

/** Initial transient auth state — nothing is known until auth resolves. */
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
    (set, get) => ({
      ...INITIAL_STATE,
      /** A cold start begins unresolved; the first Firebase emission settles it. */
      bootstrapped: false,
      onboardedUids: [],
      setStatus: (status) => set({ status }),
      /**
       * Firebase's auth subscription is the only writer of `user`, and its
       * first emission is the authoritative bootstrap signal — so this also
       * flips `bootstrapped`. The emitted user carries no onboarding answer,
       * so it is filled in from the persisted device record here; without
       * this the flag would fall back to `false` on every cold start and
       * replay setup for an already-onboarded account.
       */
      setUser: (user) =>
        set({
          user: user
            ? { ...user, hasOnboarded: isOnboarded(get().onboardedUids, user.uid) }
            : null,
          bootstrapped: true,
        }),
      setError: (error) => set({ error }),
      /**
       * Clear the identity and the transient auth status without ending the
       * launch. `bootstrapped` is deliberately left untouched: it describes
       * the launch, not the session, so resetting it to false would re-enter
       * the root navigator's cold-start spinner with no Firebase emission
       * left to turn it off.
       *
       * `onboardedUids` is left untouched for the same class of reason: it
       * describes the install, not the session. Clearing it here is exactly
       * what made setup replay on every sign-in.
       */
      reset: () => set({ ...INITIAL_STATE }),
      /**
       * Record the signed-in user as onboarded, on the user object and in the
       * persisted device record. The user object drives the current render;
       * the record is what a later sign-in restores from.
       */
      completeOnboarding: () =>
        set((state) =>
          state.user
            ? {
                user: { ...state.user, hasOnboarded: true },
                onboardedUids: markOnboarded(state.onboardedUids, state.user.uid),
              }
            : {},
        ),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ user: state.user, onboardedUids: state.onboardedUids }),
      /**
       * A cold start re-reads the last user from disk along with the record.
       * `onboardedUids` is authoritative, so the restored flag is recomputed
       * against it rather than trusted: the snapshot may name a different
       * account, or may predate a record written by another launch.
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.status = 'idle';
          state.bootstrapped = false;
          if (state.user) {
            state.user = {
              ...state.user,
              hasOnboarded: isOnboarded(state.onboardedUids, state.user.uid),
            };
          }
        }
      },

    },
  ),
);
