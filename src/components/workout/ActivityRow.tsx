import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";
import { DashboardCard } from "../ui/DashboardCard";

interface ActivityRowProps {
  day: string; // e.g., "MON"
  date: string; // e.g., "14"
  title: string;
  duration: string;
  volume: string;
  onPress?: () => void;
}

export const ActivityRow = ({
  day,
  date,
  title,
  duration,
  volume,
  onPress,
}: ActivityRowProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <DashboardCard style={styles.container}>
        {/* Date Box */}
        <View style={styles.dateBox}>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.text.tertiary}
                style={styles.icon}
              />
              <Text style={styles.statText}>{duration}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <View style={styles.statItem}>
              <Ionicons
                name="barbell-outline"
                size={14}
                color={colors.text.tertiary}
                style={styles.icon}
              />
              <Text style={styles.statText}>{volume}</Text>
            </View>
          </View>
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
        />
      </DashboardCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    marginBottom: spacing.m,
    backgroundColor: colors.background.secondary,
  },
  dateBox: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    padding: spacing.s,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.m,
    width: 50,
    height: 50,
  },
  dayText: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  dateText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  statText: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  dot: {
    color: colors.text.tertiary,
    marginHorizontal: 8,
    fontSize: 12,
  },
});
