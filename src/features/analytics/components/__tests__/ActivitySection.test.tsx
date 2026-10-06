import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockMemory = new Map<string, string>();
jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => mockMemory.set(key, value),
    remove: (key: string) => mockMemory.delete(key),
  }),
}));

import { dayKey } from "@domain/rules";
import { useHistoryStore } from "@features/history/store";

import { heatmapWeeksFor } from "../ActivityHeatmap";
import { ActivitySection } from "../ActivitySection";

describe("heatmapWeeksFor", () => {
  it("fits as many weeks as the minimum cell allows, up to a year", () => {
    expect(heatmapWeeksFor(350)).toBe(25);
    expect(heatmapWeeksFor(2000)).toBe(53);
  });
});

describe("ActivitySection", () => {
  it("summarises training days and shows a tapped day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);
    const startedAt = yesterday.getTime();
    useHistoryStore.setState({
      sessions: [{ id: "s1", routineId: null, routineName: "Push", startedAt, finishedAt: startedAt + 45 * 60_000, sets: [] }],
    });

    render(<ActivitySection width={350} />);
    expect(screen.getByTestId("activity-readout")).toHaveTextContent("1 training day in the last 25 weeks");

    fireEvent.press(screen.getByTestId(`activity-heatmap-${dayKey(startedAt)}`, { includeHiddenElements: true }));
    expect(screen.getByTestId("activity-readout")).toHaveTextContent(/· 45 min · Push$/);
  });
});
