/**
 * Post-auth setup stack: three required steps. No tab bar — setup is a
 * full-screen focused mode, and every screen draws its own header.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
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
      <Stack.Screen name="SetupUnits" component={SetupUnitsScreen} />
      <Stack.Screen name="SetupFrequency" component={SetupFrequencyScreen} />
      <Stack.Screen name="SetupRoutine" component={SetupRoutineScreen} />
    </Stack.Navigator>
  );
}
