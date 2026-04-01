import { Ionicons } from "@expo/vector-icons";
import { MuscleGroup } from "../types/workout";

interface MuscleGroupConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  label: string;
}

export const MUSCLE_GROUP_CONFIG: Record<MuscleGroup, MuscleGroupConfig> = {
  chest: {
    icon: "fitness-outline",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
    label: "Chest",
  },
  back: {
    icon: "body-outline",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.15)",
    label: "Back",
  },
  legs: {
    icon: "walk-outline",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    label: "Legs",
  },
  shoulders: {
    icon: "man-outline",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
    label: "Shoulders",
  },
  biceps: {
    icon: "barbell-outline",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.15)",
    label: "Biceps",
  },
  triceps: {
    icon: "barbell-outline",
    color: "#EC4899",
    bgColor: "rgba(236, 72, 153, 0.15)",
    label: "Triceps",
  },
  abs: {
    icon: "ellipse-outline",
    color: "#14B8A6",
    bgColor: "rgba(20, 184, 166, 0.15)",
    label: "Abs",
  },
  cardio: {
    icon: "heart-outline",
    color: "#F43F5E",
    bgColor: "rgba(244, 63, 94, 0.15)",
    label: "Cardio",
  },
  other: {
    icon: "flash-outline",
    color: "#6B7280",
    bgColor: "rgba(107, 114, 128, 0.15)",
    label: "Other",
  },
};
