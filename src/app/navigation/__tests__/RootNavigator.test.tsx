/**
 * Regression tests for the root navigator's onboarding gate.
 *
 * The reported bug: completing setup, signing out and signing back in put the
 * user through Units → Frequency → Routine again, forever. The gate itself was
 * never wrong — `!hasOnboarded → Onboarding` — the flag simply did not survive
 * the cycle. `hasOnboarded` lived only on `user`, Firebase is the only writer
 * of `user`, and the sign-out path cleared it, so every sign-in rebuilt the
 * user with the flag false.
 *
 * These tests drive the real RootNavigator against the real stores, and assert
 * which branch the gate resolves to. Child stacks are replaced with markers
 * because this suite is about the gate, not the screens inside it.
 */

// In-memory MMKV double, matching the pattern used by the auth store test.
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

/**
 * Marker for a branch of the root gate. Renders its own name so a test can
 * assert which stack the navigator chose.
 */
function mockMarker(name: string) {
  return function Marker() {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'root-branch' }, name);
  };
}

jest.mock('../MainTabs', () => ({ MainTabs: mockMarker('Main') }));
jest.mock('../OnboardingStack', () => ({ OnboardingStack: mockMarker('Onboarding') }));
jest.mock('../AuthStack', () => ({ AuthStack: mockMarker('Auth') }));
jest.mock('../IntroStack', () => ({ IntroStack: mockMarker('Intro') }));

// RootNavigator reaches the auth feature barrel, which pulls in the native
// Firebase, Google and Apple SDKs. None of them are exercised here.
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  OAuthProvider: class {
    credential = jest.fn();
  },
  GoogleAuthProvider: { credential: jest.fn() },
  signInWithCredential: jest.fn(),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
  isErrorWithCode: jest.fn(() => false),
  isSuccessResponse: jest.fn(() => false),
  statusCodes: {},
}));
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(async () => false),
  signInAsync: jest.fn(),
}));
jest.mock('@/services/firebase/config', () => ({ auth: {}, db: {} }));

import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAppStore } from '@features/onboarding';
import { useAuthStore } from '@features/auth/store/authStore';
import type { AuthUser } from '@features/auth/types';

import { RootNavigator } from '../RootNavigator';

/** A Firebase-shaped user object, carrying no reliable onboarding answer. */
function emittedUser(uid: string): AuthUser {
  return {
    uid,
    email: 'lifter@example.com',
    displayName: 'Lifter',
    photoURL: null,
    provider: 'password',
    hasOnboarded: false,
  };
}

/** Render the real root navigator and report which branch it resolved to. */
function renderRoot(): string {
  render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>,
  );
  return String(screen.getByTestId('root-branch').props.children);
}

beforeEach(() => {
  mockMemory.clear();
  // The intro group is never the subject here; pin both flags so the gate
  // reaches the auth/onboarding decision.
  useAppStore.setState({ hasSeenWelcome: true, hasSeenIntro: true });
  useAuthStore.setState({
    status: 'idle',
    user: null,
    error: null,
    bootstrapped: true,
    onboardedUids: [],
  });
});

describe('RootNavigator onboarding gate', () => {
  it('sends a brand-new account through onboarding after sign-up', () => {
    useAuthStore.getState().setUser(emittedUser('uid-new'));

    expect(renderRoot()).toBe('Onboarding');
  });

  it('resolves to Main once onboarding completes', () => {
    useAuthStore.getState().setUser(emittedUser('uid-1'));
    expect(renderRoot()).toBe('Onboarding');

    useAuthStore.getState().completeOnboarding();

    expect(renderRoot()).toBe('Main');
  });

  it('still resolves to Main after sign-out and signing back in', () => {
    const uid = 'uid-1';

    // 1. Onboard, then sign out. `reset` is what the sign-out path calls.
    useAuthStore.getState().setUser(emittedUser(uid));
    useAuthStore.getState().completeOnboarding();
    useAuthStore.getState().reset();

    // 2. Sign back in: Firebase re-emits a user with no onboarding answer.
    useAuthStore.getState().setUser(emittedUser(uid));

    expect(renderRoot()).toBe('Main');
  });

  it('survives several sign-in cycles', () => {
    useAuthStore.getState().setUser(emittedUser('uid-1'));
    useAuthStore.getState().completeOnboarding();

    for (let cycle = 0; cycle < 3; cycle += 1) {
      useAuthStore.getState().reset();
      useAuthStore.getState().setUser(emittedUser('uid-1'));
      expect(renderRoot()).toBe('Main');
    }
  });

  it('does not let one account claim another account’s completion', () => {
    useAuthStore.getState().setUser(emittedUser('uid-1'));
    useAuthStore.getState().completeOnboarding();
    useAuthStore.getState().reset();

    useAuthStore.getState().setUser(emittedUser('uid-2'));

    expect(renderRoot()).toBe('Onboarding');
  });

  it('shows Auth while signed out', () => {
    useAuthStore.getState().setUser(emittedUser('uid-1'));
    useAuthStore.getState().completeOnboarding();
    useAuthStore.getState().reset();

    expect(renderRoot()).toBe('Auth');
  });
});
