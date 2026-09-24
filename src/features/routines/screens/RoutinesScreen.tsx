/**
 * Placeholder for the routines list: saved templates the user can edit or
 * start. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

import type { ProfileStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "Routines">;

/** Pushed routines list, reached from the Profile tab. Placeholder. */
export function RoutinesScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader showBack onBack={navigation.goBack} title="Routines" />
      <View style={styles.body}>
        <EmptyState
          title="Routines"
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
