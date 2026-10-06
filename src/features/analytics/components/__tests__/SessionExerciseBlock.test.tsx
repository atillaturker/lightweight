import { render, screen } from "@testing-library/react-native";
import React from "react";

import type { ActiveSet } from "@features/workout";

import { SessionExerciseBlock } from "../SessionExerciseBlock";

/** A completed set; `rpe` only when given. */
function makeSet(id: string, rpe?: number): ActiveSet {
  return {
    id,
    weightKg: 100,
    reps: 5,
    type: "normal",
    completed: true,
    completedAt: 1,
    isPR: false,
    ...(rpe === undefined ? {} : { rpe }),
  };
}

function renderBlock(sets: ActiveSet[]) {
  render(
    <SessionExerciseBlock
      block={{
        exercise: { exerciseId: "bench-press", name: "Bench Press", pictogramId: "", order: 0, sets },
        summary: "",
      }}
      testID="block"
    />,
  );
}

describe("SessionExerciseBlock", () => {
  it("shows the RPE column with a dash for unrated sets when any set is rated", () => {
    renderBlock([makeSet("a", 8.5), makeSet("b")]);

    expect(screen.getByText("RPE")).toBeTruthy();
    expect(screen.getByTestId("block-set-0-rpe")).toHaveTextContent("8.5");
    expect(screen.getByTestId("block-set-1-rpe")).toHaveTextContent("–");
  });

  it("omits the RPE column when no set is rated", () => {
    renderBlock([makeSet("a")]);

    expect(screen.queryByText("RPE")).toBeNull();
  });
});
