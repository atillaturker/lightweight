import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { colors } from "@theme";

import { SettingsRow } from "./SettingsRow";

/** Flattens a composited style array into plain objects. */
function flattenStyle(style: unknown): Record<string, unknown>[] {
  if (Array.isArray(style)) return style.flat(Infinity).filter(Boolean) as Record<string, unknown>[];
  return style ? [style as Record<string, unknown>] : [];
}

describe("SettingsRow", () => {
  it("renders the label", async () => {
    await render(<SettingsRow label="Account" testID="row" />);

    expect(screen.getByText("Account")).toBeTruthy();
  });

  it("renders the value when variant is 'value'", async () => {
    await render(
      <SettingsRow label="Units" testID="row" value="kg" variant="value" />,
    );

    expect(screen.getByText("kg")).toBeTruthy();
  });

  it("renders the chevron glyph for 'chevron' and 'destructive'", async () => {
    const chevronRow = await render(
      <SettingsRow label="Account" testID="chevron" variant="chevron" />,
    );
    const destructiveRow = await render(
      <SettingsRow
        label="Delete"
        testID="destructive"
        variant="destructive"
      />,
    );

    expect(chevronRow.getByTestId("chevron-chevron")).toBeTruthy();
    expect(destructiveRow.getByTestId("destructive-chevron")).toBeTruthy();
  });

  it("renders a Toggle when variant is 'toggle'", async () => {
    await render(
      <SettingsRow
        label="Notifications"
        testID="row"
        toggleValue={false}
        variant="toggle"
      />,
    );

    expect(screen.getByRole("switch")).toBeTruthy();
  });

  it("calls onToggleChange when the Toggle is pressed", async () => {
    const onToggleChange = jest.fn();
    await render(
      <SettingsRow
        label="Notifications"
        onToggleChange={onToggleChange}
        testID="row"
        toggleValue={false}
        variant="toggle"
      />,
    );

    await fireEvent.press(screen.getByRole("switch"));

    expect(onToggleChange).toHaveBeenCalledWith(true);
  });

  it("calls onPress when the row is pressed", async () => {
    const onPress = jest.fn();
    await render(
      <SettingsRow label="Account" onPress={onPress} testID="row" />,
    );

    await fireEvent.press(screen.getByTestId("row"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("uses colors.error for the destructive label", async () => {
    await render(
      <SettingsRow label="Delete" testID="row" variant="destructive" />,
    );

    const flattened = flattenStyle(screen.getByText("Delete").props.style);

    expect(flattened).toContainEqual(
      expect.objectContaining({ color: colors.error }),
    );
  });
});
