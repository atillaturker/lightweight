import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { ScreenHeader } from "./ScreenHeader";

describe("ScreenHeader", () => {
  it("renders the title when provided", async () => {
    await render(<ScreenHeader title="Progress" />);

    expect(screen.getByText("Progress")).toBeTruthy();
  });

  it("does not render a back chevron when showBack is false", async () => {
    await render(<ScreenHeader title="Progress" showBack={false} />);

    expect(screen.queryByLabelText("Go back")).toBeNull();
  });

  it("renders the back chevron when showBack is true", async () => {
    await render(<ScreenHeader onBack={() => {}} showBack title="Progress" />);

    expect(screen.getByLabelText("Go back")).toBeTruthy();
  });

  it("calls onBack when the back chevron is pressed", async () => {
    const onBack = jest.fn();
    await render(<ScreenHeader onBack={onBack} showBack title="Progress" />);

    await fireEvent.press(screen.getByLabelText("Go back"));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders rightAction when provided", async () => {
    await render(
      <ScreenHeader rightAction={<Text>Save</Text>} title="Progress" />,
    );

    expect(screen.getByText("Save")).toBeTruthy();
  });
});
