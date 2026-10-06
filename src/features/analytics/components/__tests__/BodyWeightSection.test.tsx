/**
 * Main flow: log a weight from Progress, see it, mirror it, remove it.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default,
);

import {
  resetBodyWeightCloud,
  setCloudBodyWeightWriter,
  useBodyWeightStore,
} from "@features/bodyweight";

import { BodyWeightSection } from "../BodyWeightSection";

beforeEach(() => useBodyWeightStore.setState({ entries: [] }));
afterEach(() => resetBodyWeightCloud());

describe("BodyWeightSection", () => {
  it("logs today's weight, shows it in the user's unit and mirrors it", () => {
    const mirrored: number[] = [];
    setCloudBodyWeightWriter((entry) => mirrored.push(entry.weightKg));
    render(<BodyWeightSection unit="kg" width={350} />);
    expect(screen.getByText("Log your weight to see the trend.")).toBeTruthy();

    fireEvent.press(screen.getByTestId("body-weight-log"));
    fireEvent.changeText(screen.getByTestId("log-weight-input"), "80.4");
    fireEvent.press(screen.getByTestId("log-weight-save"));

    expect(screen.getByTestId("body-weight-latest")).toHaveTextContent("80.4");
    expect(mirrored).toEqual([80.4]);
  });

  it("asks for a plausible weight instead of saving nonsense", () => {
    render(<BodyWeightSection unit="kg" width={350} />);

    fireEvent.press(screen.getByTestId("body-weight-log"));
    fireEvent.changeText(screen.getByTestId("log-weight-input"), "3");
    fireEvent.press(screen.getByTestId("log-weight-save"));

    expect(screen.getByText("Enter your weight in kg.")).toBeTruthy();
    expect(useBodyWeightStore.getState().entries).toEqual([]);
  });

  it("removes today's entry", () => {
    useBodyWeightStore.getState().logWeight(80);
    render(<BodyWeightSection unit="kg" width={350} />);

    fireEvent.press(screen.getByTestId("body-weight-log"));
    fireEvent.press(screen.getByTestId("log-weight-remove"));

    expect(screen.getByText("Log your weight to see the trend.")).toBeTruthy();
    expect(useBodyWeightStore.getState().entries[0].deleted).toBe(true);
  });
});
