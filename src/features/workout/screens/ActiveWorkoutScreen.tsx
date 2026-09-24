/**
 * Placeholder for the active workout screen: the set table and rest timer.
 * Focused mode — the tab bar is hidden while this screen is on top.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

import type { TodayStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<TodayStackParamList, "ActiveWorkout">;

/** Pushed screen where sets are logged. Placeholder for now. */
export function ActiveWorkoutScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title="Active Workout"
      />
      <View style={styles.body}>
        <EmptyState
          title="Active Workout"
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
