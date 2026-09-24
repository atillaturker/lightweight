import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme";
import { WorkoutExercise } from "../../types/workout";
import { MUSCLE_GROUP_CONFIG } from "../../utils/muscleGroupConfig";

interface ExerciseBreakdownCardProps {
  exercise: WorkoutExercise;
}

export const ExerciseBreakdownCard = ({
  exercise,
}: ExerciseBreakdownCardProps) => {
  const config =
    MUSCLE_GROUP_CONFIG[exercise.muscleGroup] ?? MUSCLE_GROUP_CONFIG.other;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{exercise.name}</Text>
          <View style={styles.tags}>
            <View
              style={[styles.muscleBadge, { backgroundColor: config.bgColor }]}
            >
              <Text style={[styles.muscleText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
            {exercise.category && (
              <Text style={styles.category}>{exercise.category}</Text>
            )}
          </View>
        </View>
        <Ionicons
          name="information-circle"
          size={24}
          color={colors.text.tertiary}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.th, styles.colSet]}>SET</Text>
        <Text style={[styles.th, styles.colPrev]}>PREVIOUS</Text>
        <Text style={[styles.th, styles.colData]}>WEIGHT</Text>
        <Text style={[styles.th, styles.colData]}>REPS</Text>
      </View>

      {exercise.sets.map((set, index) => {
        if (!set.completed) return null;
        return (
          <View key={set.id} style={styles.row}>
            <Text style={[styles.td, styles.colSet]}>{index + 1}</Text>
            {/* Previous set indicator, to be implemented. Currently showing a dash placeholder. */}
            <Text style={[styles.tdPrev, styles.colPrev]}>-</Text>
            <Text style={[styles.tdData, styles.colData]}>{set.weight} kg</Text>
            <Text
              style={[
                styles.tdData,
                styles.colData,
                { color: colors.brand.primary },
              ]}
            >
              {set.reps}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.l,
  },
  name: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleText: {
    fontSize: 10,
    fontWeight: "800",
  },
  category: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    paddingBottom: spacing.s,
    marginBottom: spacing.s,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.s,
  },
  th: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  td: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  tdPrev: {
    color: colors.text.tertiary,
    fontSize: 14,
  },
  tdData: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },
  colSet: { width: 40 },
  colPrev: { flex: 1 },
  colData: { width: 60, textAlign: "right" },
});
