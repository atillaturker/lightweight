/**
 * Placeholder for the exercise picker: selects exercises while building a
 * routine, or browses the full library. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

import type { ProfileStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "ExercisePicker">;

/** Pushed exercise picker / library browser. Placeholder for now. */
export function ExercisePickerScreen({ navigation, route }: Props) {
  const title =
    route.params.mode === "picker" ? "Pick Exercise" : "Exercise Library";

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader showBack onBack={navigation.goBack} title={title} />
      <View style={styles.body}>
        <EmptyState
          title={title}
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
