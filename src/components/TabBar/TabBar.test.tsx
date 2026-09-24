import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { colors } from "@theme";

import { TabBar, type TabBarItem } from "./TabBar";

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default,
);

const ITEMS: TabBarItem[] = [
  { key: "today", label: "Today", icon: "today" },
  { key: "progress", label: "Progress", icon: "progress" },
  { key: "history", label: "History", icon: "history" },
  { key: "profile", label: "Profile", icon: "profile" },
];

/** Flattens a Text's composited style array into plain objects. */
function flattenStyle(style: unknown): Record<string, unknown>[] {
  return (Array.isArray(style) ? style : [style])
    .flat()
    .filter(Boolean) as Record<string, unknown>[];
}

describe("TabBar", () => {
  it("renders all item labels", async () => {
    await render(
      <TabBar activeKey="today" items={ITEMS} onSelect={() => {}} />,
    );

    for (const item of ITEMS) {
      expect(screen.getByText(item.label)).toBeTruthy();
    }
  });

  it("calls onSelect with the correct key when an item is pressed", async () => {
    const onSelect = jest.fn();
    await render(
      <TabBar
        activeKey="today"
        items={ITEMS}
        onSelect={onSelect}
        testID="tabs"
      />,
    );

    await fireEvent.press(screen.getByTestId("tabs-progress"));

    expect(onSelect).toHaveBeenCalledWith("progress");
  });

  it("marks the active item as selected for accessibility", async () => {
    await render(
      <TabBar activeKey="history" items={ITEMS} onSelect={() => {}} testID="tabs" />,
    );

    expect(
      screen.getByTestId("tabs-history").props.accessibilityState,
    ).toEqual({ selected: true });
  });

  it("uses the primary color for the active item's label", async () => {
    await render(
      <TabBar activeKey="today" items={ITEMS} onSelect={() => {}} />,
    );

    const flattened = flattenStyle(screen.getByText("Today").props.style);

    expect(flattened).toContainEqual(
      expect.objectContaining({ color: colors.primary }),
    );
  });

  it("uses the muted color for an inactive item's label", async () => {
    await render(
      <TabBar activeKey="today" items={ITEMS} onSelect={() => {}} />,
    );

    const flattened = flattenStyle(screen.getByText("Progress").props.style);

    expect(flattened).toContainEqual(
      expect.objectContaining({ color: colors.textMuted }),
    );
    expect(flattened).not.toContainEqual(
      expect.objectContaining({ color: colors.primary }),
    );
  });
});
