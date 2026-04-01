import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";
import { DashboardCard } from "../ui/DashboardCard";

interface RoutineCardProps {
  title: string;
  lastPerformed?: string;
  exercisesCount: number;
  duration?: string;
  onStartPress?: () => void;
  onOptionsPress?: () => void;
}

export const RoutineCard = ({
  title,
  lastPerformed,
  exercisesCount,
  duration,
  onStartPress,
  onOptionsPress,
}: RoutineCardProps) => {
  return (
    <DashboardCard style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity onPress={onOptionsPress}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {lastPerformed
          ? `Last performed: ${lastPerformed}`
          : "Not performed yet"}
      </Text>

      {/* Badges */}
      <View style={styles.statsContainer}>
        <View style={styles.statBadge}>
          <Text style={styles.statText}>{exercisesCount} Exercises</Text>
        </View>
        {duration && (
          <View style={styles.statBadge}>
            <Text style={styles.statText}>{duration}</Text>
          </View>
        )}
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onStartPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>START ROUTINE</Text>
      </TouchableOpacity>
    </DashboardCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: spacing.m,
    padding: spacing.l,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.m,
  },
  subtitle: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginBottom: spacing.m,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  statBadge: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
  },
  statText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#FACC15",
    borderRadius: 8,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.background.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
