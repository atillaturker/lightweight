/**
 * Profile tab stack: profile → routines → routine editor → exercise
 * picker. Every screen draws its own header, so the native header is
 * disabled for the stack.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileScreen } from "@features/profile/screens";
import {
  ExercisePickerScreen,
  RoutineEditorScreen,
  RoutinesScreen,
} from "@features/routines/screens";

import type { ProfileStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/** Native stack owned by the Profile tab. */
export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
      <Stack.Screen name="RoutineEditor" component={RoutineEditorScreen} />
      <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
    </Stack.Navigator>
  );
}
