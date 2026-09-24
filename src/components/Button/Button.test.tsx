import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { Button } from "./Button";

describe("Button", () => {
  it("renders the label", async () => {
    await render(<Button label="Continue" onPress={() => {}} />);

    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("calls onPress once when tapped", async () => {
    const onPress = jest.fn();
    await render(<Button label="Continue" onPress={onPress} />);

    await fireEvent.press(screen.getByText("Continue"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("exposes the button accessibility role and label", async () => {
    await render(<Button label="Continue" onPress={() => {}} />);

    expect(screen.getByRole("button").props.accessibilityLabel).toBe(
      "Continue",
    );
  });

  it("marks the button disabled for accessibility when disabled", async () => {
    await render(
      <Button disabled label="Continue" onPress={() => {}} testID="cta" />,
    );

    expect(screen.getByTestId("cta").props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true, busy: false }),
    );
  });

  it("marks the button busy for accessibility while loading", async () => {
    await render(
      <Button label="Continue" loading onPress={() => {}} testID="cta" />,
    );

    expect(screen.getByTestId("cta").props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true }),
    );
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await render(<Button disabled label="Continue" onPress={onPress} />);

    await fireEvent.press(screen.getByText("Continue"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not call onPress while loading", async () => {
    const onPress = jest.fn();
    await render(<Button loading label="Continue" onPress={onPress} />);

    await fireEvent.press(screen.getByText("Continue"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("keeps the label mounted while loading so the box keeps its size", async () => {
    await render(<Button loading label="Continue" onPress={() => {}} />);

    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("shows an activity indicator while loading", async () => {
    await render(
      <Button label="Continue" loading onPress={() => {}} testID="cta" />,
    );

    expect(screen.getByTestId("cta-loading")).toBeTruthy();
  });

  it("renders the icon alongside the label when provided", async () => {
    await render(
      <Button
        icon={<></>}
        label="Continue"
        onPress={() => {}}
        testID="icon-test"
      />,
    );

    // The icon wrapper and the label both exist inside one pressable.
    expect(screen.getByTestId("icon-test")).toBeTruthy();
    expect(screen.getByText("Continue")).toBeTruthy();
  });
});
