/**
 * Pre-auth intro stack: the welcome screen followed by two explanatory
 * screens shown before the user is asked to create an account. No tab
 * bar — the intro is a full-screen focused mode, and every screen draws
 * its own header.
 *
 * Exiting the group does not navigate to Auth by hand: the screens flip
 * the app-level flags, the root navigator sees them change and swaps the
 * whole stack for AuthStack.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  Intro1Screen,
  Intro2Screen,
  WelcomeScreen,
} from "@features/onboarding/screens";

import type { IntroStackParamList } from "./types";

const Stack = createNativeStackNavigator<IntroStackParamList>();

/**
 * Native stack shown until the intro group has been seen once.
 *
 * `hasSeenWelcome` selects the entry screen: a fresh install lands on
 * Welcome, and an install that has already dismissed it goes straight to
 * Intro1. React Navigation only reads `initialRouteName` on first mount,
 * which is correct here — the root navigator remounts this stack when
 * the flag flips.
 */
export function IntroStack({
  hasSeenWelcome,
}: {
  hasSeenWelcome: boolean;
}) {
  return (
    <Stack.Navigator
      initialRouteName={hasSeenWelcome ? "Intro1" : "Welcome"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Intro1" component={Intro1Screen} />
      <Stack.Screen name="Intro2" component={Intro2Screen} />
    </Stack.Navigator>
  );
}
