/**
 * Integration test for the onboarding main flow: choosing a unit and a
 * first routine, then completing setup.
 *
 * Asserts the contract the flow depends on — the draft store records each
 * answer, "Get started" materialises the chosen template, and the auth
 * user is flipped to onboarded so the root navigator swaps to the tabs.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

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

// The auth feature barrel reaches Firebase-backed services; the screens
// here only touch the store, so the SDK is stubbed out entirely.
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

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { OnboardingStackParamList } from '@/app/navigation/types';
import { useAuthStore } from '@features/auth/store/authStore';
import { useRoutineStore } from '@features/routines/store';

import { SetupRoutineScreen } from '../screens/SetupRoutineScreen';
import { SetupUnitsScreen } from '../screens/SetupUnitsScreen';
import { useOnboardingStore } from '../store/onboardingStore';

type UnitsProps = NativeStackScreenProps<OnboardingStackParamList, 'SetupUnits'>;
type RoutineProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'SetupRoutine'
>;

/** Build a navigation double exposing only the methods each screen uses. */
function makeNavigation() {
  return { goBack: jest.fn(), navigate: jest.fn() };
}

const unitsNavigation = makeNavigation() as unknown as UnitsProps['navigation'];
const routineNavigation =
  makeNavigation() as unknown as RoutineProps['navigation'];

const unitsRoute = {
  key: 'SetupUnits',
  name: 'SetupUnits',
  params: undefined,
} as never;
const routineRoute = {
  key: 'SetupRoutine',
  name: 'SetupRoutine',
  params: undefined,
} as never;

describe('onboarding setup flow', () => {
  beforeEach(() => {
    mockMemory.clear();
    useOnboardingStore.getState().reset();
    useRoutineStore.setState({ routines: [] });
    useAuthStore.setState({
      status: 'authenticated',
      user: {
        uid: 'uid-1',
        email: 'lifter@example.com',
        displayName: 'Lifter',
        photoURL: null,
        provider: 'password',
        hasOnboarded: false,
      },
      error: null,
    });
  });

  it('records the unit chosen on step 1', async () => {
    render(
      <SetupUnitsScreen navigation={unitsNavigation} route={unitsRoute} />,
    );

    // Kilograms is the pre-selected default.
    expect(useOnboardingStore.getState().unit).toBe('kg');

    fireEvent.press(screen.getByTestId('setup-units-lb'));

    expect(useOnboardingStore.getState().unit).toBe('lb');
  });

  it('creates the chosen template and completes onboarding on the last step', async () => {
    render(
      <SetupRoutineScreen navigation={routineNavigation} route={routineRoute} />,
    );

    fireEvent.press(screen.getByTestId('setup-routine-full-body'));
    fireEvent.press(screen.getByTestId('setup-routine-submit'));

    const routines = useRoutineStore.getState().routines;
    expect(routines).toHaveLength(1);
    expect(routines[0].name).toBe('Full Body');
    expect(routines[0].exercises).toHaveLength(15);

    expect(useAuthStore.getState().user?.hasOnboarded).toBe(true);
  });

  it('creates no routine when starting from scratch', async () => {
    render(
      <SetupRoutineScreen navigation={routineNavigation} route={routineRoute} />,
    );

    fireEvent.press(screen.getByTestId('setup-routine-scratch'));
    fireEvent.press(screen.getByTestId('setup-routine-submit'));

    expect(useRoutineStore.getState().routines).toHaveLength(0);
    expect(useAuthStore.getState().user?.hasOnboarded).toBe(true);
  });
});
