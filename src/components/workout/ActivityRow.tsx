import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";
import { Workout } from "../../types/workout";
import { formatDuration } from "../../utils/dateUtils";

interface ActivityRowProps {
  workout: Workout;
  onPress?: () => void;
}

export const ActivityRow = ({ workout, onPress }: ActivityRowProps) => {
  const dateObj = new Date(workout.date);
  const formattedDate = `${dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })} • ${dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0,
  );

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {workout.name}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
            style={styles.chevron}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.statText}>
              {formatDuration(workout.duration || 0)}
            </Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons
              name="barbell-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.statText}>
              {(workout.totalVolume || 0).toLocaleString()} kg
            </Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons
              name="list-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.statText}>
              {workout.exercises.length} Exercises
            </Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons
              name="layers-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.statText}>{totalSets} Sets</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.l,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.m,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Inter",
    marginBottom: 4,
  },
  date: {
    color: colors.text.tertiary,
    fontSize: 13,
  },
  chevron: {
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 8,
    gap: 6,
  },
  statText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
