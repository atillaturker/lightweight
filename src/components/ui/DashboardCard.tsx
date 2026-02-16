import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../theme";

interface DashboardCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DashboardCard = ({ children, style }: DashboardCardProps) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    padding: spacing.m,
  },
});
