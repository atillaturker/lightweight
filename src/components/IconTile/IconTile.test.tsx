import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { IconTile, toMonogram } from "./IconTile";

describe("IconTile", () => {
  it("renders the first letter of the text, uppercased", async () => {
    await render(<IconTile testID="tile" text="push day" variant="letter" />);

    // The monogram repeats the row label, so it is hidden from assistive tech.
    expect(screen.getByText("P", { includeHiddenElements: true })).toBeTruthy();
  });

  it("renders the given icon in the icon variant", async () => {
    await render(
      <IconTile icon={<Text>glyph</Text>} testID="tile" variant="icon" />,
    );

    expect(screen.getByText("glyph")).toBeTruthy();
  });
});

describe("toMonogram", () => {
  it("skips leading whitespace", () => {
    expect(toMonogram("  legs")).toBe("L");
  });

  it("returns an empty string for an empty name", () => {
    expect(toMonogram("   ")).toBe("");
  });
});
