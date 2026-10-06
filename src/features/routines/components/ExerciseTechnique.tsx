/**
 * "Technique" section for an exercise: the start and end pose side by
 * side (DESIGN.md §9), then the numbered how-to steps. Renders nothing
 * when the exercise has neither, so callers can place it unconditionally.
 * The caller owns the spacing above the section.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Exercise } from "@domain/entities";
import { SectionHeader } from "@components/SectionHeader";
import { colors, spacing, type } from "@theme";

import {
  ExerciseIllustration,
  hasExerciseIllustration,
  type ExerciseFrame,
} from "./ExerciseIllustration";

/** Tallest a frame may be (DESIGN.md §9). */
const MAX_FRAME_HEIGHT = 240;
const FRAME_GAP = spacing.md;
const FRAMES: readonly { frame: ExerciseFrame; label: string }[] = [
  { frame: "start", label: "Start" },
  { frame: "end", label: "End" },
];

/** Props for {@link ExerciseTechnique}. */
export interface ExerciseTechniqueProps {
  exercise: Pick<Exercise, "id" | "instructions">;
  /** Width available to the section, i.e. the screen minus its gutters. */
  contentWidth: number;
}

/** Illustration frames and how-to steps for one exercise. */
export function ExerciseTechnique({
  exercise,
  contentWidth,
}: ExerciseTechniqueProps): React.ReactElement | null {
  const steps = exercise.instructions ?? [];
  const illustrated = hasExerciseIllustration(exercise.id);
  if (!illustrated && steps.length === 0) return null;

  const frameWidth = (contentWidth - FRAME_GAP) / 2;
  const frameHeight = Math.min(MAX_FRAME_HEIGHT, frameWidth);

  return (
    <View testID="exercise-technique">
      <SectionHeader label="Technique" variant="rule" />
      {illustrated ? (
        <View style={styles.frames}>
          {FRAMES.map(({ frame, label }) => (
            <View key={frame} style={styles.frame}>
              <ExerciseIllustration
                exerciseId={exercise.id}
                frame={frame}
                height={frameHeight}
                testID={`exercise-technique-${frame}`}
                width={frameWidth}
              />
              <Text style={styles.frameLabel}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {steps.map((step, index) => (
        <View key={index} style={styles.step}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  frames: {
    flexDirection: "row",
    gap: FRAME_GAP,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  frame: { flex: 1, alignItems: "center", gap: spacing.xs },
  frameLabel: { ...type.caption, color: colors.textMuted },
  step: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  stepNumber: {
    ...type.label,
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
    minWidth: spacing.lg,
  },
  stepText: { ...type.body, color: colors.textBody, flex: 1 },
});
