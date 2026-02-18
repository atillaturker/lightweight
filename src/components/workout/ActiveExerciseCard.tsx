import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing } from "../../theme";
import { WorkoutExercise } from "../../types/workout";

interface ActiveExerciseCardProps {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (
    setId: string,
    field: "weight" | "reps" | "completed",
    value: any,
  ) => void;
  onRemoveExercise: () => void;
}

export const ActiveExerciseCard = ({
  exercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onRemoveExercise,
}: ActiveExerciseCardProps) => {
  return (
    <View style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity onPress={onRemoveExercise}>
          <Ionicons
            name="trash-outline"
            size={14}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Set List Header */}
      <View style={styles.setRowHeader}>
        <Text style={[styles.headerLabel, styles.colSet]}>SET</Text>
        <Text style={[styles.headerLabel, styles.colPrev]}>PREVIOUS</Text>
        <Text style={[styles.headerLabel, styles.colKg]}>KG</Text>
        <Text style={[styles.headerLabel, styles.colReps]}>REPS</Text>
        <View style={styles.colCheck} />
      </View>

      {/* Sets */}
      {exercise.sets.map((set, index) => {
        const isCompleted = set.completed;
        const rowBg = isCompleted
          ? "rgba(19, 127, 236, 0.1)" // Slight blue tint
          : "transparent";

        return (
          <View
            key={set.id}
            style={[styles.setRow, { backgroundColor: rowBg }]}
          >
            <View style={styles.colSet}>
              <Text style={styles.setNumber}>{index + 1}</Text>
            </View>
            <View style={styles.colPrev}>
              <Text style={styles.prevText}>-</Text>
            </View>
            <View style={styles.colInput}>
              <TextInput
                style={[
                  styles.input,
                  isCompleted && { color: colors.brand.primary },
                ]}
                keyboardType="numeric"
                placeholder=""
                placeholderTextColor={colors.text.tertiary}
                value={set.weight.toString()}
                onChangeText={(text) => onUpdateSet(set.id, "weight", text)}
              />
            </View>
            <View style={styles.colInput}>
              <TextInput
                style={[
                  styles.input,
                  isCompleted && { color: colors.brand.primary },
                ]}
                keyboardType="numeric"
                placeholder=""
                placeholderTextColor={colors.text.tertiary}
                value={set.reps.toString()}
                onChangeText={(text) => onUpdateSet(set.id, "reps", text)}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.checkButton,
                isCompleted && styles.checkButtonCompleted,
              ]}
              onPress={() => onUpdateSet(set.id, "completed", !isCompleted)}
            >
              <Ionicons
                name="checkmark"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Add Set Button */}
      <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
        <Ionicons name="add" size={16} color={colors.brand.primary} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.m,
    borderRadius: 8,
  },
  header: {
    padding: spacing.m,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  setRowHeader: {
    flexDirection: "row",
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
    marginBottom: spacing.xs,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.tertiary,
    textAlign: "center",
  },
  colSet: { width: 30, marginRight: 12 },
  colPrev: { flex: 1,  textAlign: "center" },
  colKg: { width: 45, marginHorizontal: 4, borderRadius: 4 ,  },
  colReps: { width: 45, marginRight: 18, borderRadius: 4 ,  },
  colInput: { width: 45, marginHorizontal: 4, borderRadius: 4 },
  colCheck: { width: 30, alignItems: "center" },
  setNumber: {
    color: colors.text.tertiary,
    fontWeight: "600",
    textAlign: "center",
  },
  prevText: {
    color: colors.text.tertiary,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    color: colors.text.primary,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  checkButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkButtonCompleted: {
    backgroundColor: colors.brand.primary,
    borderRadius: 12,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.m,
    gap: 4,
  },
  addSetText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
