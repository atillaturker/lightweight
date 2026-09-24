/**
 * Placeholder for the Today tab home screen: daily brief and, when a
 * session is active, a Resume CTA. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

/** Root screen of the Today tab. */
export function HomeTodayScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Today" />
      <View style={styles.body}>
        <EmptyState
          title="Today"
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
