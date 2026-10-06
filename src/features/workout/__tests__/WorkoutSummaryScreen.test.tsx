/**
 * Workout Summary: the "Muscles worked" map for a recorded session.
 */
import { render, screen } from "@testing-library/react-native";
import React from "react";

const mockMemory = new Map<string, string>();
jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => mockMemory.set(key, value),
    remove: (key: string) => mockMemory.delete(key),
  }),
}));
jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default,
);

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { Workout } from "@domain/entities";
import { registerDataProviders } from "@/app/providers";
import type { TodayStackParamList } from "@/app/navigation/types";

import { WorkoutSummaryScreen } from "../screens/WorkoutSummaryScreen";
import { resetSessionDataProviders } from "../services";
import { useLastSessionStore } from "../store";

type Props = NativeStackScreenProps<TodayStackParamList, "WorkoutSummary">;

const SESSION: Workout = {
  id: "s1",
  routineId: null,
  routineName: "Push",
  startedAt: 1_700_000_000_000,
  finishedAt: 1_700_000_600_000,
  sets: [
    {
      id: "set-1",
      exerciseId: "bench-press",
      workoutId: "s1",
      weightKg: 80,
      reps: 8,
      type: "normal",
      completed: true,
      completedAt: 1_700_000_100_000,
      order: 0,
    },
  ],
};

beforeEach(() => registerDataProviders());
afterEach(() => resetSessionDataProviders());

describe("WorkoutSummaryScreen muscles", () => {
  it("shows the muscles the session worked", () => {
    useLastSessionStore.setState({ lastSession: SESSION });
    const navigation = { popToTop: jest.fn() } as unknown as Props["navigation"];
    const route = { params: { sessionId: "s1" } } as Props["route"];

    render(<WorkoutSummaryScreen navigation={navigation} route={route} />);

    expect(screen.getByTestId("summary-muscles")).toBeTruthy();
    expect(screen.getByLabelText(/Muscles worked: Chest/)).toBeTruthy();
  });
});
