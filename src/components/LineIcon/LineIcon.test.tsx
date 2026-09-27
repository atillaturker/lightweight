import { render } from "@testing-library/react-native";
import React from "react";

import { colors } from "@theme";

import { LineIcon, type LineIconName } from "./LineIcon";

const NAMES: LineIconName[] = [
  "clock",
  "trophy",
  "flame",
  "trend",
  "list",
  "sliders",
  "database",
  "device",
];

/** Props of the rendered svg root, as surfaced by the test renderer. */
interface SvgRootProps {
  width?: number;
  stroke?: string;
  fill?: string;
}

/** Read the svg root props from a rendered LineIcon. */
function svgProps(element: unknown): SvgRootProps {
  if (!element) throw new Error("LineIcon rendered nothing");
  return (element as { props: SvgRootProps }).props;
}

describe("LineIcon", () => {
  it("renders every glyph", async () => {
    for (const name of NAMES) {
      const { toJSON } = await render(<LineIcon name={name} />);

      expect(toJSON()).toBeTruthy();
    }
  });

  it("defaults to a 16px muted outline", async () => {
    const { toJSON } = await render(<LineIcon name="clock" />);

    const props = svgProps(toJSON());
    expect(props.width).toBe(16);
    expect(props.stroke).toBe(colors.textMuted);
    expect(props.fill).toBe("none");
  });

  it("applies the size and color props", async () => {
    const { toJSON } = await render(
      <LineIcon color={colors.textPrimary} name="trophy" size={32} />,
    );

    const props = svgProps(toJSON());
    expect(props.width).toBe(32);
    expect(props.stroke).toBe(colors.textPrimary);
  });
});
