/**
 * One exercise slot in the routine editor: the exercise's illustration
 * tile (the same one the picker shows), name and group label, the
 * tappable `sets × reps` target, and the drag grip.
 */
import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { MuscleGroup } from "@domain/entities";
import { fineSpacing, spacing, type, createStyles, useTheme } from "@theme";

import { ExerciseThumb } from "./ExerciseThumb";

/** Props for {@link RoutineEditorRow}. */
export interface RoutineEditorRowProps {
  exerciseId: string;
  name: string;
  /** `undefined` for an exercise missing from the library. */
  muscleGroup: MuscleGroup | undefined;
  targetSets: number;
  /** Reps, or seconds for a timed exercise. */
  targetReps: number;
  /** `time` shows the target as seconds ("3 × 30s"). */
  measure?: "reps" | "time";
  /** Reps are per side ("3 × 8 / side"). */
  perSide?: boolean;
  /** "A1", "A2"… when the slot is in a superset. */
  supersetLabel?: string;
  /** Draw the hairline above the row (every row but the first). */
  showDivider: boolean;
  onEditTarget: () => void;
}

/** Three-line grip glyph; visual-only until drag ships. */
function GripGlyph(): React.ReactElement {
  const { colors } = useTheme();
  return (
    <Svg
      fill="none"
      height={16}
      stroke={colors.textMuted}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <Path d="M4 8h16 M4 12h16 M4 16h16" />
    </Svg>
  );
}

/** Editor row for one exercise slot. */
export function RoutineEditorRow({
  exerciseId,
  name,
  muscleGroup,
  targetSets,
  targetReps,
  measure = "reps",
  perSide = false,
  supersetLabel,
  showDivider,
  onEditTarget,
}: RoutineEditorRowProps): React.ReactElement {
  const styles = useStyles();
  return (
    <View>
      {showDivider ? <View style={styles.rowHairline} /> : null}
      <View style={styles.row}>
        <ExerciseThumb exerciseId={exerciseId} />

        <View style={styles.textColumn}>
          <Text numberOfLines={1} style={styles.exerciseName}>
            {name}
          </Text>
          <Text style={styles.muscleLabel}>
            {supersetLabel !== undefined ? `Superset ${supersetLabel} · ` : ""}
            {muscleGroup
              ? muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)
              : "Other"}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={`Target ${targetSets} by ${targetReps}${
            measure === "time" ? " seconds" : perSide ? " per side" : ""
          }`}
          accessibilityRole="button"
          onPress={onEditTarget}
          style={styles.targetCell}
        >
          <Text style={styles.targetText}>
            {`${targetSets} × ${targetReps}${
              measure === "time" ? "s" : perSide ? " / side" : ""
            }`}
          </Text>
        </Pressable>

        <View style={styles.gripColumn}>
          <GripGlyph />
        </View>
      </View>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  rowHairline: { height: 1, backgroundColor: colors.hairline },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
  },

  textColumn: {
    flex: 1,
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  exerciseName: {
    ...type.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  muscleLabel: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },

  targetCell: {
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  targetText: {
    ...type.label,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },

  gripColumn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
}));
