/**
 * Line illustration of an exercise (DESIGN.md §9).
 *
 * The frames are Everkinetic drawings (CC BY-SA 4.0) reduced to their ink
 * paths by `scripts/build-exercise-catalog.mjs`. Every path is filled with
 * `currentColor`, so the drawing takes the text color of the active theme.
 * Assets ship in the app binary and load through `LocalSvg`, which reads
 * them from disk instead of the JS bundle.
 */
import React from "react";
import { View } from "react-native";
import { LocalSvg } from "react-native-svg/css";

import { useTheme } from "@theme";

import { EXERCISE_MEDIA } from "../data/exerciseMedia";

/** Which pose to draw: the start or the end of the movement. */
export type ExerciseFrame = "start" | "end";

/** Props for {@link ExerciseIllustration}. */
export interface ExerciseIllustrationProps {
  exerciseId: string;
  frame: ExerciseFrame;
  width: number;
  height: number;
  testID?: string;
}

/** Whether the exercise has an illustration to show. */
export function hasExerciseIllustration(exerciseId: string): boolean {
  return Object.prototype.hasOwnProperty.call(EXERCISE_MEDIA, exerciseId);
}

/**
 * One frame of an exercise illustration, scaled to fit the box. The box is
 * sized up front because the drawing loads asynchronously, so the layout
 * does not jump when it appears. Renders nothing when the exercise has no
 * illustration; callers decide the fallback (usually the muscle icon).
 */
export function ExerciseIllustration({
  exerciseId,
  frame,
  width,
  height,
  testID,
}: ExerciseIllustrationProps): React.ReactElement | null {
  const { colors } = useTheme();
  if (!hasExerciseIllustration(exerciseId)) return null;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height }}
      testID={testID}
    >
      <LocalSvg
        asset={EXERCISE_MEDIA[exerciseId][frame]}
        color={colors.textPrimary}
        height={height}
        width={width}
      />
    </View>
  );
}
