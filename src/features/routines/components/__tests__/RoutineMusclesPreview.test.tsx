import { render, screen } from "@testing-library/react-native";
import React from "react";

import { EXERCISE_LIBRARY } from "../../services";
import { RoutineMusclesPreview } from "../RoutineMusclesPreview";

const BY_ID = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));

describe("RoutineMusclesPreview", () => {
  it("previews what the routine trains", () => {
    render(
      <RoutineMusclesPreview
        byId={BY_ID}
        slots={[{ exerciseId: "bench-press", targetSets: 3, targetReps: 8, order: 0 }]}
      />,
    );

    expect(screen.getByTestId("routine-muscles")).toBeTruthy();
    expect(screen.getByLabelText(/This routine trains: Chest/)).toBeTruthy();
  });

  it("renders nothing for an empty routine", () => {
    render(<RoutineMusclesPreview byId={BY_ID} slots={[]} />);

    expect(screen.queryByTestId("routine-muscles")).toBeNull();
  });
});
