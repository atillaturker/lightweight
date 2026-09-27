/**
 * One exercise slot in the routine editor: muscle-group icon, name and
 * group label, the tappable `sets × reps` target, and the drag grip.
 * Moved out of RoutineEditorScreen unchanged.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { MuscleIcon } from "@components/MuscleIcon";
import type { MuscleGroup } from "@domain/entities";
import { colors, fineSpacing, spacing, type } from "@theme";

/** Props for {@link RoutineEditorRow}. */
export interface RoutineEditorRowProps {
  name: string;
  /** `undefined` for an exercise missing from the library. */
  muscleGroup: MuscleGroup | undefined;
  targetSets: number;
  targetReps: number;
  /** Draw the hairline above the row (every row but the first). */
  showDivider: boolean;
  onEditTarget: () => void;
}

/** Three-line grip glyph; visual-only until drag ships. */
function GripGlyph(): React.ReactElement {
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
  name,
  muscleGroup,
  targetSets,
  targetReps,
  showDivider,
  onEditTarget,
}: RoutineEditorRowProps): React.ReactElement {
  return (
    <View>
      {showDivider ? <View style={styles.rowHairline} /> : null}
      <View style={styles.row}>
        <View style={styles.iconColumn}>
          <MuscleIcon group={muscleGroup ?? "core"} size={24} />
        </View>

        <View style={styles.textColumn}>
          <Text numberOfLines={1} style={styles.exerciseName}>
            {name}
          </Text>
          <Text style={styles.muscleLabel}>
            {muscleGroup
              ? muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)
              : "Other"}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={`Target ${targetSets} by ${targetReps}`}
          accessibilityRole="button"
          onPress={onEditTarget}
          style={styles.targetCell}
        >
          <Text style={styles.targetText}>{`${targetSets} × ${targetReps}`}</Text>
        </Pressable>

        <View style={styles.gripColumn}>
          <GripGlyph />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowHairline: { height: 1, backgroundColor: colors.hairline },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
  },

  iconColumn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
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
});
