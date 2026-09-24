import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { colors } from "@theme";

import { Pill } from "./Pill";

/** Flattens a composited style array into plain objects. */
function flattenStyle(style: unknown): Record<string, unknown>[] {
  if (Array.isArray(style)) return style.flat(Infinity).filter(Boolean) as Record<string, unknown>[];
  return style ? [style as Record<string, unknown>] : [];
}

describe("Pill", () => {
  it("renders the label", async () => {
    await render(<Pill label="Chest" />);

    expect(screen.getByText("Chest")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await render(<Pill label="Chest" onPress={onPress} testID="pill" />);

    await fireEvent.press(screen.getByTestId("pill"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("uses the primary background when selected", async () => {
    await render(<Pill label="Chest" selected testID="pill" />);

    const flattened = flattenStyle(screen.getByTestId("pill").props.style);

    expect(flattened).toContainEqual(
      expect.objectContaining({ backgroundColor: colors.primary }),
    );
  });
});
