import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../theme";

export const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>SettingsScreen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.l,
  },
});
