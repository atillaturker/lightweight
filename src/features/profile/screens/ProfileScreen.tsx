/**
 * Placeholder for the Profile tab: account, units, and entries into
 * routines and the exercise library. Real content is built later.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors } from "@theme";

/** Root screen of the Profile tab. */
export function ProfileScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Profile" />
      <View style={styles.body}>
        <EmptyState
          title="Profile"
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
