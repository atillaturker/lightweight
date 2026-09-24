import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";
import { MUSCLE_GROUP_CONFIG } from "../../utils/muscleGroupConfig";

export interface ExerciseInfoCardProps {
  name: string;
  category?: string;
  muscleGroup: string;
  onDelete: () => void;
}

const ExerciseInfoCardComponent = ({
  name,
  category,
  muscleGroup,
  onDelete,
}: ExerciseInfoCardProps) => {
  const config = MUSCLE_GROUP_CONFIG[muscleGroup] ?? MUSCLE_GROUP_CONFIG.other;

  return (
    <View style={styles.infoCard}>
      <View
        style={[styles.infoIconWrapper, { backgroundColor: config.bgColor }]}
      >
        <Ionicons name={config.icon as any} size={28} color={config.color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.exerciseName}>{name}</Text>
        <View style={styles.infoMeta}>
          {category && (
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{category}</Text>
            </View>
          )}
          <View style={[styles.infoBadge, { backgroundColor: config.bgColor }]}>
            <Text style={[styles.infoBadgeText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="trash-outline"
          size={18}
          color={colors.semantic.error}
        />
      </TouchableOpacity>
    </View>
  );
};

export const ExerciseInfoCard = memo(ExerciseInfoCardComponent);

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.l,
    borderRadius: 16,
    gap: spacing.m,
  },
  infoIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
    gap: 6,
  },
  exerciseName: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  infoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoBadgeText: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: "600",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
