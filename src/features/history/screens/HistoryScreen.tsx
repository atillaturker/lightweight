/**
 * Placeholder for the History tab: a reverse-chronological list of past
 * sessions. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

/** Root screen of the History tab. */
export function HistoryScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="History" />
      <View style={styles.body}>
        <EmptyState
          title="History"
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
