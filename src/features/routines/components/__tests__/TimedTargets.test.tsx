import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { RoutineEditorRow } from "../RoutineEditorRow";
import { TargetSheet } from "../TargetSheet";

function row(props: Partial<React.ComponentProps<typeof RoutineEditorRow>>) {
  render(
    <RoutineEditorRow
      exerciseId="weighted-front-plank"
      muscleGroup="core"
      name="Plank"
      onEditTarget={jest.fn()}
      showDivider={false}
      targetReps={30}
      targetSets={3}
      {...props}
    />,
  );
}

describe("RoutineEditorRow target", () => {
  it("shows seconds for a timed exercise", () => {
    row({ measure: "time" });
    expect(screen.getByText("3 × 30s")).toBeTruthy();
  });

  it("marks per-side reps", () => {
    row({ perSide: true, targetReps: 8 });
    expect(screen.getByText("3 × 8 / side")).toBeTruthy();
  });
});

describe("TargetSheet", () => {
  it("offers seconds instead of reps for a timed exercise", () => {
    const onConfirm = jest.fn();
    render(
      <TargetSheet
        exerciseName="Plank"
        initialReps={30}
        initialSets={3}
        measure="time"
        onClose={jest.fn()}
        onConfirm={onConfirm}
        onRemove={jest.fn()}
        visible
      />,
    );

    expect(screen.getByText("SECONDS")).toBeTruthy();
    expect(screen.queryByText("REPS")).toBeNull();
    fireEvent.press(screen.getByText("45"));
    fireEvent.press(screen.getByTestId("target-sheet-save"));
    expect(onConfirm).toHaveBeenCalledWith(3, 45);
  });
});
