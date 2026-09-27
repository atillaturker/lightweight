/**
 * Welcome screen contract: what each first-run action does to the two
 * app-level flags. These are the only two exits from the screen, and
 * both must mark the welcome as seen so it never reappears on this
 * install.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// In-memory MMKV double, matching the pattern used by the app store test.
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

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IntroStackParamList } from '@/app/navigation/types';
import { useAppStore } from '../store/appStore';

import { WelcomeScreen } from '../screens/WelcomeScreen';

type Props = NativeStackScreenProps<IntroStackParamList, 'Welcome'>;

const navigation = {
  navigate: jest.fn(),
} as unknown as Props['navigation'];

const route = {
  key: 'Welcome',
  name: 'Welcome',
  params: undefined,
} as never;

beforeEach(() => {
  mockMemory.clear();
  useAppStore.setState({ hasSeenWelcome: false, hasSeenIntro: false });
  (navigation.navigate as jest.Mock).mockClear();
});

describe('WelcomeScreen', () => {
  it('shows exactly one primary action and the account switch', () => {
    render(<WelcomeScreen navigation={navigation} route={route} />);

    expect(screen.getByTestId('welcome-get-started')).toBeTruthy();
    expect(screen.getByTestId('welcome-have-account')).toBeTruthy();
  });

  it('continues into the intro group and marks the welcome seen', () => {
    render(<WelcomeScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(useAppStore.getState().hasSeenWelcome).toBe(true);
    // The intro group is still owed to the user.
    expect(useAppStore.getState().hasSeenIntro).toBe(false);
    expect(navigation.navigate).toHaveBeenCalledWith('Intro1');
  });

  it('skips straight past the intro for a returning user', () => {
    render(<WelcomeScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByTestId('welcome-have-account'));

    expect(useAppStore.getState().hasSeenWelcome).toBe(true);
    // Both flags set — the root navigator swaps to the auth stack.
    expect(useAppStore.getState().hasSeenIntro).toBe(true);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('renders all four product-data preview cards', () => {
    render(<WelcomeScreen navigation={navigation} route={route} />);

    expect(screen.getByText('Bench Press · Est. 1RM')).toBeTruthy();
    expect(screen.getByText('Back Squat · Est. 1RM')).toBeTruthy();
    expect(screen.getByText('Deadlift · Est. 1RM')).toBeTruthy();
    expect(screen.getByText('Overhead Press · Est. 1RM')).toBeTruthy();
  });
});
