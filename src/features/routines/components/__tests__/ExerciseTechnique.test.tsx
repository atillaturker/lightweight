import { render, screen } from "@testing-library/react-native";
import React from "react";

import { ExerciseTechnique } from "../ExerciseTechnique";

describe("ExerciseTechnique", () => {
  it("shows both poses and numbered steps", () => {
    render(
      <ExerciseTechnique
        contentWidth={350}
        exercise={{ id: "bench-press", instructions: ["Lie down.", "Press up."] }}
      />,
    );
    // Frames are decorative and hidden from screen readers.
    const hidden = { includeHiddenElements: true };
    expect(screen.getByTestId("exercise-technique-start", hidden)).toBeTruthy();
    expect(screen.getByTestId("exercise-technique-end", hidden)).toBeTruthy();
    expect(screen.getByText("Lie down.")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("shows steps without frames when there is no illustration", () => {
    render(
      <ExerciseTechnique
        contentWidth={350}
        exercise={{ id: "lat-pulldown", instructions: ["Pull."] }}
      />,
    );
    expect(
      screen.queryByTestId("exercise-technique-start", { includeHiddenElements: true }),
    ).toBeNull();
    expect(screen.getByText("Pull.")).toBeTruthy();
  });

  it("renders nothing without steps or illustration", () => {
    render(<ExerciseTechnique contentWidth={350} exercise={{ id: "face-pull" }} />);
    expect(screen.queryByTestId("exercise-technique")).toBeNull();
  });
});
