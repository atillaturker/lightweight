import { render, screen } from "@testing-library/react-native";
import React from "react";

import { colors } from "@theme";

import {
  SPARKLINE_HEIGHT,
  TrendSparkline,
  calculateSparklinePath,
} from "./TrendSparkline";

describe("TrendSparkline", () => {
  it("draws a primary line for a rising series", async () => {
    await render(
      <TrendSparkline points={[1, 2, 3]} testID="spark" width={90} />,
    );

    const line = screen.getByTestId("spark-line");
    expect(line.props.stroke).toBe(colors.primary);
  });

  it("draws nothing with fewer than two values", async () => {
    await render(
      <TrendSparkline points={[null, 4, null]} testID="spark" width={90} />,
    );

    expect(screen.getByTestId("spark")).toBeTruthy();
    expect(screen.queryByTestId("spark-line")).toBeNull();
  });
});

describe("calculateSparklinePath", () => {
  it("puts the lowest value at the bottom and the highest at the top", () => {
    const path = calculateSparklinePath([0, 10], 100, SPARKLINE_HEIGHT);

    expect(path).toBe("M0.75 29.25 L99.25 0.75");
  });

  it("skips gaps without breaking the x positions", () => {
    const path = calculateSparklinePath([0, null, 10], 100, SPARKLINE_HEIGHT);

    expect(path).toBe("M0.75 29.25 L99.25 0.75");
  });

  it("centers a flat series vertically", () => {
    const path = calculateSparklinePath([5, 5], 100, SPARKLINE_HEIGHT);

    expect(path).toBe("M0.75 15.00 L99.25 15.00");
  });

  it("returns null for a single value", () => {
    expect(calculateSparklinePath([5], 100, SPARKLINE_HEIGHT)).toBeNull();
  });
});
