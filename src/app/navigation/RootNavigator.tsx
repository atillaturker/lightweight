/**
 * Top-level navigator. Renders exactly one child based on intro, auth and
 * onboarding state: IntroStack, AuthStack, OnboardingStack, or MainTabs.
 * Native headers are disabled everywhere — screens draw their own.
 *
 * While the persisted Firebase session is still resolving on cold start
 * it renders a centered spinner instead, so the Auth screens never flash
 * before the user is known. The gate is `bootstrapped`, not `status`:
 * `status` is driven by the credential-exchange hooks and stays `idle`
 * on a cold start, so keying the spinner on it would hang forever.
 *
 * Intro is checked first: the product is welcomed and explained before
 * the user is asked to log in, and both flags persist across sign-outs
 * so neither group is shown twice on the same install. `hasSeenWelcome`
 * only selects the entry screen inside the same IntroStack.
 */
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth, useAuthStore } from "@features/auth";
import { colors } from "@theme";

import { useAppStore } from "../store";
import { AuthStack } from "./AuthStack";
import { IntroStack } from "./IntroStack";
import { MainTabs } from "./MainTabs";
import { OnboardingStack } from "./OnboardingStack";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Swaps the root stack whenever auth or onboarding state changes. */
export function RootNavigator() {
  const { isAuthenticated } = useAuth();
  const hasSeenWelcome = useAppStore((s) => s.hasSeenWelcome);
  const hasSeenIntro = useAppStore((s) => s.hasSeenIntro);
  const hasOnboarded = useAuthStore((s) => s.user?.hasOnboarded ?? false);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  if (!bootstrapped) {
    return (
      <View style={styles.bootstrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasSeenIntro ? (
        <Stack.Screen name="Intro">
          {() => <IntroStack hasSeenWelcome={hasSeenWelcome} />}
        </Stack.Screen>
      ) : !isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  bootstrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
