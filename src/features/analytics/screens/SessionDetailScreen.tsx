/**
 * Placeholder for the session detail screen reached from the History tab.
 * Shows every set of one session. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

import type { HistoryStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<HistoryStackParamList, "SessionDetail">;

/** Pushed session detail screen. Placeholder for now. */
export function SessionDetailScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title="Session Detail"
      />
      <View style={styles.body}>
        <EmptyState
          title="Session Detail"
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
