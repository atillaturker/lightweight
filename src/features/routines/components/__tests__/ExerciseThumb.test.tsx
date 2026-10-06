import { render, screen } from "@testing-library/react-native";
import React from "react";

import { RoutineEditorRow } from "../RoutineEditorRow";
import { ExerciseThumb } from "../ExerciseThumb";

/** Decorative drawings are hidden from screen readers; include them. */
const hidden = { includeHiddenElements: true };

describe("ExerciseThumb", () => {
  it("draws the illustration when the exercise has one", () => {
    render(<ExerciseThumb exerciseId="bench-press" />);
    const tile = screen.getByTestId("exercise-thumb-bench-press");
    expect(tile).not.toBeEmptyElement();
  });

  it("leaves the tile empty when the exercise has no illustration", () => {
    render(<ExerciseThumb exerciseId="face-pull" />);
    const tile = screen.getByTestId("exercise-thumb-face-pull", hidden);
    expect(tile).toBeEmptyElement();
  });
});

describe("RoutineEditorRow", () => {
  it("leads with the same illustration tile as the picker", () => {
    render(
      <RoutineEditorRow
        exerciseId="bench-press"
        muscleGroup="chest"
        name="Bench Press"
        onEditTarget={jest.fn()}
        showDivider={false}
        targetReps={8}
        targetSets={3}
      />,
    );
    expect(screen.getByTestId("exercise-thumb-bench-press")).toBeTruthy();
  });
});
