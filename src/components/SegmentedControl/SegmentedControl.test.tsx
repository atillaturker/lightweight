import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "4w", label: "4W" },
  { value: "12w", label: "12W" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
];

describe("SegmentedControl", () => {
  it("renders all option labels", async () => {
    await render(
      <SegmentedControl onChange={() => {}} options={OPTIONS} value="4w" />,
    );

    for (const option of OPTIONS) {
      expect(screen.getByText(option.label)).toBeTruthy();
    }
  });

  it("calls onChange with the correct value when a segment is pressed", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl
        onChange={onChange}
        options={OPTIONS}
        testID="range"
        value="4w"
      />,
    );

    await fireEvent.press(screen.getByTestId("range-6m"));

    expect(onChange).toHaveBeenCalledWith("6m");
  });

  it("does not call onChange when the already-selected value is pressed", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl
        onChange={onChange}
        options={OPTIONS}
        testID="range"
        value="4w"
      />,
    );

    await fireEvent.press(screen.getByTestId("range-4w"));

    expect(onChange).not.toHaveBeenCalled();
  });
});
