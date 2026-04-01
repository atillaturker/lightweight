import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";
import { WorkoutExercise } from "../../types/workout";
import { MUSCLE_GROUP_CONFIG } from "../../utils/muscleGroupConfig";

interface ReadOnlyExerciseCardProps {
  exercise: WorkoutExercise;
  onPress: () => void;
  onRemove: () => void;
}

export const ReadOnlyExerciseCard = ({
  exercise,
  onPress,
  onRemove,
}: ReadOnlyExerciseCardProps) => {
  const config =
    MUSCLE_GROUP_CONFIG[exercise.muscleGroup] ?? MUSCLE_GROUP_CONFIG.other;

  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left — Muscle Group Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={28} color={config.color} />
      </View>

      {/* Center — Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>

        <View style={styles.metaRow}>
          {exercise.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{exercise.category}</Text>
            </View>
          )}
          <View
            style={[styles.muscleBadge, { backgroundColor: config.bgColor }]}
          >
            <Text style={[styles.muscleText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.setsRow}>
          <Ionicons
            name="layers-outline"
            size={14}
            color={colors.text.tertiary}
          />
          <Text style={styles.setsText}>
            {completedSets}/{totalSets} sets completed
          </Text>
        </View>
      </View>

      {/* Right — Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.removeButton}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.m,
    borderRadius: 12,
    marginHorizontal: spacing.l,
    marginTop: spacing.m,
    gap: spacing.m,
  },

  /* Icon */
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Info */
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: "600",
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  muscleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  setsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  setsText: {
    color: colors.text.tertiary,
    fontSize: 12,
  },

  /* Actions */
  actions: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
  },
  removeButton: {
    padding: 4,
  },
  chevron: {
    opacity: 0.5,
  },
});
