import { render, screen } from "@testing-library/react-native";
import React from "react";

import {
  RING_MAX_RATIO,
  RingChart,
  calculateRingGeometry,
  calculateRingStrokeWidth,
} from "./RingChart";

describe("RingChart", () => {
  it("renders without crashing given valid props", async () => {
    await render(<RingChart max={50} size={88} testID="ring" value={42} />);

    expect(screen.getByTestId("ring")).toBeTruthy();
    expect(screen.getByTestId("ring-track")).toBeTruthy();
    expect(screen.getByTestId("ring-fill")).toBeTruthy();
  });

  it("renders the center label when provided", async () => {
    await render(
      <RingChart
        centerLabel="84%"
        max={50}
        size={88}
        testID="ring"
        value={42}
      />,
    );

    expect(screen.getByText("84%")).toBeTruthy();
  });

  it("renders the sublabel when provided", async () => {
    await render(
      <RingChart
        centerLabel="84%"
        centerSublabel="goal"
        max={50}
        size={88}
        testID="ring"
        value={42}
      />,
    );

    expect(screen.getByText("goal")).toBeTruthy();
  });

  it("does NOT render a center label when centerLabel is omitted", async () => {
    await render(<RingChart max={50} size={88} testID="ring" value={42} />);

    expect(screen.queryByText("84%")).toBeNull();
    expect(screen.queryByText("goal")).toBeNull();
  });

  it("caps the visual ratio at 0.96 for value === max", async () => {
    await render(<RingChart max={50} size={88} testID="ring" value={50} />);

    const geometry = calculateRingGeometry(50, 50, 88);
    const expectedOffset = geometry.circumference * (1 - RING_MAX_RATIO);

    expect(Number(screen.getByTestId("ring-fill").props.strokeDashoffset)).toBeCloseTo(
      expectedOffset,
      5,
    );
    expect(geometry.ratio).toBe(RING_MAX_RATIO);
  });

  it("uses a 4px stroke on hero rings and 3px on smaller rings", () => {
    expect(calculateRingStrokeWidth(88)).toBe(4);
    expect(calculateRingStrokeWidth(80)).toBe(4);
    expect(calculateRingStrokeWidth(60)).toBe(3);
  });
});
