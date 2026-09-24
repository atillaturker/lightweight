import React from "react";
import { StyleSheet, Text, ViewStyle } from "react-native";
import { colors, spacing } from "../../theme";
import { DashboardCard } from "./DashboardCard";

interface StatCardProps {
  label: string;
  value: string;
  containerStyle?: ViewStyle;
}

export const StatCard = ({ label, value, containerStyle }: StatCardProps) => {
  return (
    <DashboardCard style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </DashboardCard>
  );
};

const styles = StyleSheet.create({
  label: {
    color: colors.text.secondary,
    fontSize: 16,
    marginBottom: spacing.s,
    fontFamily: "Inter",
  },
  value: {
    color: colors.text.primary,
    fontSize: 18,
    fontFamily: "Inter",
  },
});

export default StatCard;
