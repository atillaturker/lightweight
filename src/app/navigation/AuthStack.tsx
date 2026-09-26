/**
 * Unauthenticated stack: log-in and sign-up. Log-in is the default
 * route after the intro; sign-up is reached from its account-switch row.
 * No tab bar — auth is a full-screen focused mode, and every screen
 * draws its own header.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LogInScreen, SignUpScreen } from "@features/auth/screens";

import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Native stack shown while no session exists. */
export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="LogIn"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="LogIn" component={LogInScreen} />
    </Stack.Navigator>
  );
}
