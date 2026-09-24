import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { TextTabs } from "./TextTabs";

const OPTIONS = [
  { value: "1rm", label: "1RM" },
  { value: "volume", label: "Volume" },
  { value: "reps", label: "Reps" },
];

describe("TextTabs", () => {
  it("renders all option labels", async () => {
    await render(
      <TextTabs onChange={() => {}} options={OPTIONS} value="1rm" />,
    );

    for (const option of OPTIONS) {
      expect(screen.getByText(option.label)).toBeTruthy();
    }
  });

  it("calls onChange with the correct value when a tab is pressed", async () => {
    const onChange = jest.fn();
    await render(
      <TextTabs
        onChange={onChange}
        options={OPTIONS}
        testID="metric"
        value="1rm"
      />,
    );

    await fireEvent.press(screen.getByTestId("metric-volume"));

    expect(onChange).toHaveBeenCalledWith("volume");
  });

  it("renders all option labels when scrollable", async () => {
    await render(
      <TextTabs
        onChange={() => {}}
        options={OPTIONS}
        scrollable
        value="1rm"
      />,
    );

    for (const option of OPTIONS) {
      expect(screen.getByText(option.label)).toBeTruthy();
    }
  });
});
