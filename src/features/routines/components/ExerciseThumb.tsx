/**
 * 40px leading tile for an exercise row (DESIGN.md §8): the end pose of
 * the exercise illustration when one exists, otherwise the muscle icon.
 */
import React from "react";

import type { Exercise } from "@domain/entities";
import { IconTile } from "@components/IconTile";
import { MuscleIcon } from "@components/MuscleIcon";
import { spacing } from "@theme";

import { ExerciseIllustration, hasExerciseIllustration } from "./ExerciseIllustration";

/** Drawing size inside the 40px tile, leaving a 4px inset. */
const DRAWING_SIZE = spacing.xxxl;

/** Props for {@link ExerciseThumb}. */
export interface ExerciseThumbProps {
  exercise: Pick<Exercise, "id" | "muscleGroup">;
}

/** Leading visual for exercise lists. */
export function ExerciseThumb({ exercise }: ExerciseThumbProps): React.ReactElement {
  const icon = hasExerciseIllustration(exercise.id) ? (
    <ExerciseIllustration
      exerciseId={exercise.id}
      frame="end"
      height={DRAWING_SIZE}
      width={DRAWING_SIZE}
    />
  ) : (
    <MuscleIcon group={exercise.muscleGroup} size={24} />
  );
  return <IconTile icon={icon} testID={`exercise-thumb-${exercise.id}`} variant="icon" />;
}
