/**
 * Placeholder for onboarding setup step 3 (first routine template). Real
 * content is built later. Completing this step sets `hasOnboarded: true`.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, spacing } from "@theme";

import type { OnboardingStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetupRoutine">;

/** First-routine placeholder. Final onboarding step, so no tab bar yet. */
export function SetupRoutineScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader showBack onBack={navigation.goBack} title="First Routine" />
      <View style={styles.body}>
        <EmptyState
          title="First Routine"
          message="Placeholder — implemented in a later task."
        />
      </View>
      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={() => navigation.replace("SetupUnits")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1, justifyContent: "center" },
  footer: { padding: spacing.lg },
});
