import { render } from "@testing-library/react-native";
import React from "react";

import type { Exercise } from "@domain/entities";

import { MuscleIcon, type MuscleGroup } from "../MuscleIcon";

const GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
];

/** Props of the rendered svg root, as surfaced by the test renderer. */
interface SvgRootProps {
  width?: number;
  height?: number;
  stroke?: string;
}

/** Read the svg root props from a rendered MuscleIcon. */
function svgProps(element: unknown): SvgRootProps {
  if (!element) throw new Error("MuscleIcon rendered nothing");
  return (element as { props: SvgRootProps }).props;
}

describe("MuscleIcon", () => {
  it("renders for each of the 6 groups without crashing", async () => {
    for (const group of GROUPS) {
      const { toJSON } = await render(<MuscleIcon group={group} />);

      expect(toJSON()).toBeTruthy();
    }
  });

  it("accepts the domain muscle group union, including core", async () => {
    const group: Exercise["muscleGroup"] = "core";

    const { toJSON } = await render(<MuscleIcon group={group} />);

    expect(toJSON()).toBeTruthy();
  });

  it("applies the size prop", async () => {
    const { toJSON } = await render(
      <MuscleIcon group="chest" size={40} testID="icon" />,
    );

    const props = svgProps(toJSON());
    expect(props.width).toBe(40);
    expect(props.height).toBe(40);
  });

  it("applies the color prop", async () => {
    const { toJSON } = await render(
      <MuscleIcon color="#3B82F6" group="back" testID="icon" />,
    );

    expect(svgProps(toJSON()).stroke).toBe("#3B82F6");
  });
});
