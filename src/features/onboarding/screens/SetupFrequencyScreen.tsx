/**
 * Placeholder for onboarding setup step 2 (weekly frequency). Real content
 * is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, spacing } from "@theme";

import type { OnboardingStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetupFrequency">;

/** Weekly frequency placeholder: a target of days per week. */
export function SetupFrequencyScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader showBack onBack={navigation.goBack} title="Frequency" />
      <View style={styles.body}>
        <EmptyState
          title="Frequency"
          message="Placeholder — implemented in a later task."
        />
      </View>
      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={() => navigation.navigate("SetupRoutine")}
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
