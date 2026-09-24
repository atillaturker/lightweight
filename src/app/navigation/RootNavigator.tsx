/**
 * Top-level navigator. Renders exactly one child based on auth and
 * onboarding state: AuthStack, OnboardingStack, or MainTabs. Native
 * headers are disabled everywhere — screens draw their own.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { OnboardingStack } from "./OnboardingStack";
import { useAuthState } from "./useAuthState";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Swaps the root stack whenever auth or onboarding state changes. */
export function RootNavigator() {
  const { isAuthenticated, hasOnboarded } = useAuthState();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
