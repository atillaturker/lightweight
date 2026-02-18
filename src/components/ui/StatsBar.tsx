import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../theme";

interface StatsBarProps {
  stats: {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
  }[];
  style?: StyleProp<ViewStyle>;
}

export const StatsBar = ({ stats, style }: StatsBarProps) => {
  return (
    <View style={[styles.container, style]}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.item}>
            <Ionicons name={stat.icon} size={16} color={colors.text.tertiary} />
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: spacing.m,
    marginHorizontal: spacing.l,
    marginTop: spacing.s, // Add top margin to separate from content above
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  item: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  value: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  label: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.ui.border,
  },
});
