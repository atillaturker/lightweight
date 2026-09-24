import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { Radio } from "./Radio";

describe("Radio", () => {
  it("renders the label when provided", async () => {
    await render(<Radio label="Kilograms" selected={false} />);

    expect(screen.getByText("Kilograms")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await render(<Radio onPress={onPress} selected={false} testID="radio" />);

    await fireEvent.press(screen.getByTestId("radio"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await render(
      <Radio disabled onPress={onPress} selected={false} testID="radio" />,
    );

    await fireEvent.press(screen.getByTestId("radio"));

    expect(onPress).not.toHaveBeenCalled();
  });
});
