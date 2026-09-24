/**
 * Progress tab stack: trends overview → per-exercise detail. Every screen
 * draws its own header, so the native header is disabled for the stack.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  ExerciseDetailScreen,
  ProgressScreen,
} from "@features/analytics/screens";

import type { ProgressStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProgressStackParamList>();

/** Native stack owned by the Progress tab. */
export function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
    </Stack.Navigator>
  );
}
