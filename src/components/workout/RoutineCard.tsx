import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";

interface RoutineCardProps {
  title: string;
  tags?: string[];
  exercisesCount: number;
  duration?: string;
  onStartPress?: () => void;
  isActive?: boolean; // To show the yellow border focus like in the image
}

export const RoutineCard = ({
  title,
  tags = [],
  exercisesCount,
  duration,
  onStartPress,
  isActive = false,
}: RoutineCardProps) => {
  return (
    <View style={[styles.container, isActive && styles.containerActive]}>
      {/* Left Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={14}
              color={colors.text.tertiary}
            />
            <Text style={styles.statText}>{exercisesCount} Exercises</Text>
          </View>
          {duration && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="clock-time-four"
                size={14}
                color={colors.text.tertiary}
              />
              <Text style={styles.statText}>{duration}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Play Button */}
      <TouchableOpacity
        style={[styles.playButton, isActive && styles.playButtonActive]}
        onPress={onStartPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="play"
          size={24}
          color={isActive ? colors.background.primary : colors.text.secondary}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: "transparent",
  },
  containerActive: {
    borderLeftWidth: 4,
    borderLeftColor: "#FACC15",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: spacing.m,
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tagBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.l,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: colors.text.tertiary,
    fontSize: 13,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.m,
  },
  playButtonActive: {
    backgroundColor: "#FACC15",
  },
});
