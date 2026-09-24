/**
 * Placeholder for the log-in screen. The real screen is built in Task 10.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, spacing } from "@theme";

import type { AuthStackParamList } from "@/app/navigation/types";

/** Placeholder log-in screen: header, empty state, and one CTA. */
export function LogInScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "LogIn">) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Log In" />
      <View style={styles.body}>
        <EmptyState
          title="Log In"
          message="Placeholder — implemented in a later task."
        />
      </View>
      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={() => navigation.navigate("SignUp")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1, justifyContent: "center" },
  footer: { padding: spacing.lg },
});
