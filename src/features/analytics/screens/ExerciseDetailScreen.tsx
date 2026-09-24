/**
 * Placeholder for the per-exercise analytics detail screen: e1RM curve,
 * set history, and PR markers. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

import type { HistoryStackParamList, ProgressStackParamList } from "@/app/navigation/types";

type Props =
  | NativeStackScreenProps<ProgressStackParamList, "ExerciseDetail">
  | NativeStackScreenProps<HistoryStackParamList, "ExerciseDetailFromHistory">;

/**
 * Pushed detail screen for one exercise. Shared by the Progress tab
 * (`ExerciseDetail`) and the History tab (`ExerciseDetailFromHistory`),
 * so its props are the union of both route types. Placeholder for now.
 */
export function ExerciseDetailScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title="Exercise Detail"
      />
      <View style={styles.body}>
        <EmptyState
          title="Exercise Detail"
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
