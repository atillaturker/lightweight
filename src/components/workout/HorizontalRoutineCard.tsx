import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";

interface HorizontalRoutineCardProps {
  title: string;
  lastPerformed?: string;
  exercisesCount: number;
  duration?: string;
  onStartPress?: () => void;
  onOptionsPress?: () => void;
}

export const HorizontalRoutineCard = ({
  title,
  lastPerformed,
  exercisesCount,
  duration,
  onStartPress,
  onOptionsPress,
}: HorizontalRoutineCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={onOptionsPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.lastPerformed}>
        Last performed: {lastPerformed || "Never"}
      </Text>

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

      <TouchableOpacity
        style={styles.startButton}
        onPress={onStartPress}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>START ROUTINE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing.l,
    marginRight: spacing.m,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
    marginRight: spacing.m,
  },
  lastPerformed: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: spacing.m,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  statBadge: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "#FACC15",
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: colors.background.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
