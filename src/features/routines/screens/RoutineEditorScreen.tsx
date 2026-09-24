/**
 * Placeholder for the routine editor: create or edit one template and its
 * ordered exercises. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

import type { ProfileStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "RoutineEditor">;

/** Pushed editor for a new or existing routine. Placeholder for now. */
export function RoutineEditorScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title="Routine Editor"
      />
      <View style={styles.body}>
        <EmptyState
          title="Routine Editor"
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
