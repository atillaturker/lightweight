/**
 * History tab stack: session list → session detail → exercise detail.
 * Every screen draws its own header, so the native header is disabled.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  ExerciseDetailScreen,
  SessionDetailScreen,
} from "@features/analytics/screens";
import { HistoryScreen } from "@features/history/screens";

import type { HistoryStackParamList } from "./types";

const Stack = createNativeStackNavigator<HistoryStackParamList>();

/** Native stack owned by the History tab. */
export function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
      <Stack.Screen
        name="ExerciseDetailFromHistory"
        component={ExerciseDetailScreen}
      />
    </Stack.Navigator>
  );
}
