/**
 * Placeholder for onboarding step 1 (intro). Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, spacing } from "@theme";

import type { OnboardingStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Intro1">;

/** First intro screen. No back chevron — it is the start of the flow. */
export function Intro1Screen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Welcome" />
      <View style={styles.body}>
        <EmptyState
          title="Intro"
          message="Placeholder — implemented in a later task."
        />
      </View>
      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={() => navigation.navigate("Intro2")}
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
