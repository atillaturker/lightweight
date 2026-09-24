/**
 * Placeholder for the sign-up screen. The real screen — shared layout with
 * LogIn, inline validation, no disabled CTA — is built in Task 10.
 */
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, spacing } from "@theme";

import type { AuthStackParamList } from "@/app/navigation/types";

/** Placeholder sign-up screen: header, empty state, and one CTA. */
export function SignUpScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "SignUp">) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Sign Up" />
      <View style={styles.body}>
        <EmptyState
          title="Sign Up"
          message="Placeholder — implemented in a later task."
        />
      </View>
      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={() => navigation.navigate("LogIn")}
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
