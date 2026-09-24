import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={56}
        color={colors.text.tertiary}
        style={{ opacity: 0.4 }}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["5xl"],
    paddingHorizontal: spacing["3xl"],
    gap: spacing.s,
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
    marginTop: spacing.m,
  },
  subtitle: {
    color: colors.text.tertiary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
