/**
 * 40px leading tile for an exercise row (DESIGN.md §8): the end pose of
 * the exercise illustration. An exercise without one gets an empty tile —
 * no stand-in glyph — so rows stay aligned without implying a picture.
 */
import React from "react";

import { IconTile } from "@components/IconTile";
import { spacing } from "@theme";

import { ExerciseIllustration } from "./ExerciseIllustration";

/** Drawing size inside the 40px tile, leaving a 4px inset. */
const DRAWING_SIZE = spacing.xxxl;

/** Props for {@link ExerciseThumb}. */
export interface ExerciseThumbProps {
  exerciseId: string;
}

/** Leading visual for exercise lists. */
export function ExerciseThumb({ exerciseId }: ExerciseThumbProps): React.ReactElement {
  // ExerciseIllustration renders nothing when there is no drawing.
  const icon = (
    <ExerciseIllustration
      exerciseId={exerciseId}
      frame="end"
      height={DRAWING_SIZE}
      width={DRAWING_SIZE}
    />
  );
  return <IconTile icon={icon} testID={`exercise-thumb-${exerciseId}`} variant="icon" />;
}
