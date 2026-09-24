import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title", async () => {
    await render(<EmptyState testID="empty" title="No workouts yet" />);

    expect(screen.getByText("No workouts yet")).toBeTruthy();
  });

  it("renders the message when provided", async () => {
    await render(
      <EmptyState
        message="Log your first session to see progress."
        testID="empty"
        title="No workouts yet"
      />,
    );

    expect(
      screen.getByText("Log your first session to see progress."),
    ).toBeTruthy();
  });

  it("does not render the message when not provided", async () => {
    await render(<EmptyState testID="empty" title="No workouts yet" />);

    expect(screen.queryByTestId("empty-message")).toBeNull();
  });

  it("renders the action when provided", async () => {
    await render(
      <EmptyState
        action={<Text>Start workout</Text>}
        testID="empty"
        title="No workouts yet"
      />,
    );

    expect(screen.getByTestId("empty-action")).toBeTruthy();
    expect(screen.getByText("Start workout")).toBeTruthy();
  });
});
