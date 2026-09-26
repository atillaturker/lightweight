/**
 * Integration test for the sign-up main flow: filling the form and
 * submitting it hands the validated values to the auth hook.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockSignUpEmail = jest.fn().mockResolvedValue(undefined);
const mockSignInGoogle = jest.fn().mockResolvedValue(undefined);
const mockSignInApple = jest.fn().mockResolvedValue(undefined);

jest.mock('../../hooks/useSignInActions', () => ({
  useSignInActions: () => ({
    signUpEmail: mockSignUpEmail,
    signInGoogle: mockSignInGoogle,
    signInApple: mockSignInApple,
  }),
}));

jest.mock('../../store/authStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ status: 'idle', error: null }),
}));

// The auth feature barrel imports Firebase-backed services; the screen
// itself does not, so the module is stubbed out entirely.
jest.mock('firebase/auth', () => ({}));
jest.mock('@/services/firebase/config', () => ({ auth: {}, db: {} }));

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/app/navigation/types';

import { SignUpScreen } from '../SignUpScreen';

const navigationMock = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const navigation = navigationMock as unknown as NativeStackScreenProps<
  AuthStackParamList,
  'SignUp'
>['navigation'];

const route = { key: 'SignUp', name: 'SignUp', params: undefined } as never;

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the headline and the three fields', async () => {
    await render(<SignUpScreen navigation={navigation} route={route} />);

    expect(screen.getByText('Create your account')).toBeTruthy();
    expect(screen.getByTestId('signup-email')).toBeTruthy();
    expect(screen.getByTestId('signup-password')).toBeTruthy();
    expect(screen.getByTestId('signup-display-name')).toBeTruthy();
  });

  it('does not submit while the form is invalid', async () => {
    await render(<SignUpScreen navigation={navigation} route={route} />);

    await fireEvent.press(screen.getByTestId('signup-submit'));

    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });

  it('submits the validated values once every field is valid', async () => {
    await render(<SignUpScreen navigation={navigation} route={route} />);

    await fireEvent.changeText(
      screen.getByTestId('signup-email'),
      'alex@example.com',
    );
    await fireEvent.changeText(
      screen.getByTestId('signup-password'),
      'supersecret1',
    );
    await fireEvent.changeText(
      screen.getByTestId('signup-display-name'),
      'Alex Rivera',
    );
    await fireEvent.press(screen.getByTestId('signup-terms'));
    await fireEvent.press(screen.getByTestId('signup-submit'));

    expect(mockSignUpEmail).toHaveBeenCalledWith({
      email: 'alex@example.com',
      password: 'supersecret1',
      displayName: 'Alex Rivera',
    });
  });

  it('navigates to log in from the account switch row', async () => {
    await render(<SignUpScreen navigation={navigation} route={route} />);

    await fireEvent.press(screen.getByText('Log in'));

    expect(navigation.navigate).toHaveBeenCalledWith('LogIn');
  });
});
