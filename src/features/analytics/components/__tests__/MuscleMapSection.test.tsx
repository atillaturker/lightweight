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

import type { Workout } from "@domain/entities";
import { registerDataProviders } from "@/app/providers";
import { useHistoryStore } from "@features/history/store";
import { resetSessionDataProviders } from "@features/workout";

import { MuscleMapSection } from "../MuscleMapSection";

/** A session from yesterday with three bench-press sets. */
function benchSession(): Workout {
  const startedAt = Date.now() - 24 * 60 * 60 * 1000;
  return {
    id: "s1",
    routineId: null,
    routineName: "Push",
    startedAt,
    finishedAt: startedAt + 1,
    sets: [0, 1, 2].map((order) => ({
      id: `set-${order}`,
      exerciseId: "bench-press",
      workoutId: "s1",
      weightKg: 80,
      reps: 8,
      type: "normal" as const,
      completed: true,
      completedAt: startedAt,
      order,
    })),
  };
}

beforeEach(() => registerDataProviders());
afterEach(() => resetSessionDataProviders());

describe("MuscleMapSection", () => {
  it("invites logging when there is no training in the window", () => {
    useHistoryStore.setState({ sessions: [] });
    render(<MuscleMapSection width={350} />);

    expect(screen.getByTestId("muscle-map-readout")).toHaveTextContent(
      "Log a workout to see which muscles you trained.",
    );
    expect(screen.queryByTestId("muscle-map-untrained")).toBeNull();
  });

  it("shows a region's exact sets on tap and clears on a second tap", () => {
    useHistoryStore.setState({ sessions: [benchSession()] });
    render(<MuscleMapSection width={350} />);

    const chest = screen.getAllByTestId("muscle-map-front-chest", { includeHiddenElements: true })[0];
    fireEvent.press(chest);
    expect(screen.getByTestId("muscle-map-readout")).toHaveTextContent("Chest · 3 sets");

    fireEvent.press(chest);
    expect(screen.getByTestId("muscle-map-readout")).toHaveTextContent("Tap a muscle to see its sets.");
  });

  it("lists the regions left untrained", () => {
    useHistoryStore.setState({ sessions: [benchSession()] });
    render(<MuscleMapSection width={350} />);

    const gaps = screen.getByTestId("muscle-map-untrained");
    expect(gaps).toHaveTextContent(/Not trained: .*Calves/);
    expect(gaps).not.toHaveTextContent(/Chest/);
  });
});
