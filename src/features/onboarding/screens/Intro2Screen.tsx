/**
 * Placeholder for onboarding step 2 (intro). Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, spacing } from "@theme";

import type { OnboardingStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Intro2">;

/** Second intro screen. Pushed, so it shows the back chevron. */
export function Intro2Screen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title="How It Works"
      />
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
          onPress={() => navigation.navigate("SetupUnits")}
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
