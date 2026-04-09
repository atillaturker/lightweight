import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors, spacing } from "../../theme";
import { DashboardCard } from "../ui/DashboardCard";

interface QuickStartCardProps {
  onStartPress?: () => void;
  workoutStatus?: "active" | "completed" | "discarded";
  activeWorkoutName?: string;
  onResumePress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const QuickStartCard = ({
  onStartPress,
  onResumePress,
  style,
  workoutStatus,
  activeWorkoutName,
}: QuickStartCardProps) => {
  const isResume = workoutStatus === "active";

  return (
    <DashboardCard
      style={[styles.container, isResume && styles.containerResume, style]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.badge,
            isResume ? styles.badgeResume : styles.badgeNew,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isResume ? styles.badgeTextResume : styles.badgeTextNew,
            ]}
          >
            {isResume ? "ACTIVE WORKOUT" : "QUICK START"}
          </Text>
        </View>
        <Text style={styles.title}>
          {isResume ? activeWorkoutName : "Empty Workout"}
        </Text>
        <Text style={styles.subtitle}>
          {isResume
            ? "Tap to continue your workout"
            : "Log your sets as you go, freestyle."}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.addButton,
          isResume ? styles.addButtonResume : styles.addButtonNew,
        ]}
        onPress={isResume ? onResumePress : onStartPress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isResume ? "play" : "add"}
          size={24}
          color={isResume ? colors.brand.primary : colors.background.primary}
        />
      </TouchableOpacity>
    </DashboardCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerResume: {
    borderWidth: 1,
    borderColor: "rgba(19, 127, 236, 0.3)",
  },
  content: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.s,
  },
  badgeNew: {
    backgroundColor: "#FACC15",
  },
  badgeResume: {
    backgroundColor: "rgba(19, 127, 236, 0.2)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  badgeTextNew: {
    color: colors.background.primary,
  },
  badgeTextResume: {
    color: colors.brand.primary,
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: colors.text.tertiary,
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.m,
  },
  addButtonNew: {
    backgroundColor: "#FACC15",
  },
  addButtonResume: {
    backgroundColor: "rgba(19, 127, 236, 0.1)",
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  seeAllText: {
    color: "#FACC15",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
