/**
 * Profile tab stack: the profile screen only. Routines are managed from
 * Home (Today tab), so their routes live in the Today stack. Every screen
 * draws its own header, so the native header is disabled for the stack.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileScreen } from "@features/profile/screens";

import type { ProfileStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/** Native stack owned by the Profile tab. */
export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
