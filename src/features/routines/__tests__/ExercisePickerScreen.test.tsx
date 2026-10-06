/**
 * Exercise picker over the full dataset-backed library: filtering,
 * search, leading visuals, and committing a selection.
 */
import { fireEvent, render, screen, within } from "@testing-library/react-native";
import React from "react";

import { useRoutineStore } from "../store";
import { ExercisePickerScreen } from "../screens/ExercisePickerScreen";

import type { TodayStackParamList } from "@/app/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TodayStackParamList, "ExercisePicker">;

function renderPicker(routineId?: string) {
  const navigation = { goBack: jest.fn() };
  const route = { params: { mode: "picker", routineId } } as Props["route"];
  render(
    <ExercisePickerScreen
      navigation={navigation as unknown as Props["navigation"]}
      route={route}
    />,
  );
  return navigation;
}

describe("ExercisePickerScreen", () => {
  it("leads rows with the illustration tile", () => {
    renderPicker();
    expect(screen.getByTestId("exercise-thumb-bench-press")).toBeTruthy();
  });

  it("filters to core exercises with the Core chip", () => {
    renderPicker();
    fireEvent.press(screen.getByRole("button", { name: "Core" }));
    expect(screen.queryByRole("button", { name: "Bench Press" })).toBeNull();
    expect(screen.getAllByText(/^Core · /).length).toBeGreaterThan(0);
  });

  it("finds exercises by their target muscle", () => {
    renderPicker();
    fireEvent.changeText(screen.getByLabelText("Search exercises"), "lats");
    const row = screen.getByRole("button", { name: "Lat Pulldown" });
    expect(within(row).getByText("Back · Cable")).toBeTruthy();
  });

  it("commits the selection to the routine", () => {
    const addExercisesToRoutine = jest.fn();
    useRoutineStore.setState({ addExercisesToRoutine });
    const navigation = renderPicker("routine-1");

    fireEvent.press(screen.getByRole("button", { name: "Bench Press" }));
    fireEvent.press(screen.getByTestId("exercise-picker-submit"));

    expect(addExercisesToRoutine).toHaveBeenCalledWith("routine-1", ["bench-press"]);
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
