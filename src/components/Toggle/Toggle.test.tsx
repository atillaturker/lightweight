import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("calls onChange with the flipped value when pressed", async () => {
    const onChange = jest.fn();
    await render(
      <Toggle onChange={onChange} testID="toggle" value={false} />,
    );

    await fireEvent.press(screen.getByTestId("toggle"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when a selected toggle is pressed", async () => {
    const onChange = jest.fn();
    await render(<Toggle onChange={onChange} testID="toggle" value />);

    await fireEvent.press(screen.getByTestId("toggle"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = jest.fn();
    await render(
      <Toggle
        disabled
        onChange={onChange}
        testID="toggle"
        value={false}
      />,
    );

    await fireEvent.press(screen.getByTestId("toggle"));

    expect(onChange).not.toHaveBeenCalled();
  });
});
