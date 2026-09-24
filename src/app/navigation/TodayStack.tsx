/**
 * Today tab stack: daily brief → active workout → summary. Every screen
 * draws its own header, so the native header is disabled for the stack.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  ActiveWorkoutScreen,
  HomeTodayScreen,
  WorkoutSummaryScreen,
} from "@features/workout/screens";

import type { TodayStackParamList } from "./types";

const Stack = createNativeStackNavigator<TodayStackParamList>();

/** Native stack owned by the Today tab. */
export function TodayStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeToday" component={HomeTodayScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
    </Stack.Navigator>
  );
}
