/**
 * Placeholder for the post-session summary screen: volume, sets, and the
 * conditional PR section. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

import type { TodayStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<TodayStackParamList, "WorkoutSummary">;

/** Pushed screen shown when a session ends. Placeholder for now. */
export function WorkoutSummaryScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title="Workout Summary"
      />
      <View style={styles.body}>
        <EmptyState
          title="Workout Summary"
          message="Placeholder — implemented in a later task."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1, justifyContent: "center" },
});
