import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { setCloudCustomExerciseWriter, resetCustomExerciseCloud } from "../services";
import { useCustomExerciseStore } from "../store";
import { CustomExerciseScreen } from "../screens/CustomExerciseScreen";

import type { TodayStackParamList } from "@/app/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TodayStackParamList, "CustomExercise">;

function renderScreen(initialName?: string) {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };
  const route = {
    params: { picker: { mode: "picker", routineId: "r1" }, initialName },
  } as Props["route"];
  render(
    <CustomExerciseScreen navigation={navigation as unknown as Props["navigation"]} route={route} />,
  );
  return navigation;
}

beforeEach(() => useCustomExerciseStore.setState({ exercises: [] }));
afterEach(() => resetCustomExerciseCloud());

describe("CustomExerciseScreen", () => {
  it("asks for a name instead of creating a nameless exercise", () => {
    const navigation = renderScreen();

    fireEvent.press(screen.getByTestId("custom-exercise-create"));

    expect(screen.getByText("Give the exercise a name.")).toBeTruthy();
    expect(useCustomExerciseStore.getState().exercises).toEqual([]);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("creates the exercise, mirrors it, and hands it back to the picker", () => {
    const mirrored: string[] = [];
    setCloudCustomExerciseWriter((exercise) => mirrored.push(exercise.name));
    const navigation = renderScreen("Seal Row");

    fireEvent.press(screen.getByTestId("custom-exercise-group-back"));
    fireEvent.press(screen.getByTestId("custom-exercise-create"));

    const [created] = useCustomExerciseStore.getState().exercises;
    expect(created).toMatchObject({ name: "Seal Row", muscleGroup: "back", isCustom: true });
    expect(mirrored).toEqual(["Seal Row"]);
    expect(navigation.navigate).toHaveBeenCalledWith({
      name: "ExercisePicker",
      params: { mode: "picker", routineId: "r1", createdExerciseId: created.id },
      merge: true,
    });
  });
});
