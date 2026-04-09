import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme";
import { Workout } from "../../types/workout";
import { formatDuration } from "../../utils/dateUtils";

interface WorkoutDetailHeroProps {
  workout: Workout;
}

export const WorkoutDetailHero = ({ workout }: WorkoutDetailHeroProps) => {
  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0,
  );

  const dateObj = new Date(workout.date);
  const formattedDate = `${dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })} • ${dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <View style={styles.container}>
      <Ionicons
        name="barbell"
        size={140}
        color="rgba(255, 255, 255, 0.03)"
        style={styles.bgIcon}
      />
      <Text style={styles.focusText}>WORKOUT FOCUS</Text>
      <Text style={styles.title} numberOfLines={2}>
        {workout.name}
      </Text>
      <Text style={styles.date}>{formattedDate}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>
            {formatDuration(workout.duration || 0)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Volume</Text>
          <Text style={styles.statValue}>
            {(workout.totalVolume || 0).toLocaleString()} kg
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Sets</Text>
          <Text style={styles.statValue}>{totalSets}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Exercises</Text>
          <Text style={styles.statValue}>{workout.exercises.length}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing.xl,
    marginHorizontal: spacing.l,
    overflow: "hidden",
  },
  bgIcon: {
    position: "absolute",
    right: -20,
    top: -20,
    transform: [{ rotate: "-45deg" }],
  },
  focusText: {
    color: colors.brand.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: spacing.s,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "900",
    fontFamily: "Inter",
    marginBottom: spacing.xs,
  },
  date: {
    color: colors.text.tertiary,
    fontSize: 14,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.l,
  },
  statBox: {
    width: "50%",
  },
  statLabel: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: colors.brand.primary,
    fontSize: 18,
    fontFamily: "Inter",
    fontWeight: "700",
  },
});
