/**
 * First-run stack: two intro screens followed by three required setup
 * steps. No tab bar — onboarding is a full-screen focused mode, and every
 * screen draws its own header.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  Intro1Screen,
  Intro2Screen,
  SetupFrequencyScreen,
  SetupRoutineScreen,
  SetupUnitsScreen,
} from "@features/onboarding/screens";

import type { OnboardingStackParamList } from "./types";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/** Native stack shown after auth when onboarding is not complete. */
export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Intro1" component={Intro1Screen} />
      <Stack.Screen name="Intro2" component={Intro2Screen} />
      <Stack.Screen name="SetupUnits" component={SetupUnitsScreen} />
      <Stack.Screen name="SetupFrequency" component={SetupFrequencyScreen} />
      <Stack.Screen name="SetupRoutine" component={SetupRoutineScreen} />
    </Stack.Navigator>
  );
}
