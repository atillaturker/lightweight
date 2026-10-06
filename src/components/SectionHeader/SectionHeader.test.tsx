import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders the label", async () => {
    await render(<SectionHeader label="This week" testID="header" />);

    expect(screen.getByText("This week")).toBeTruthy();
  });

  it("renders the action slot when provided", async () => {
    await render(
      <SectionHeader
        action={<Text>See all</Text>}
        label="Recent"
        testID="header"
      />,
    );

    expect(screen.getByTestId("header-action")).toBeTruthy();
    expect(screen.getByText("See all")).toBeTruthy();
  });

  it("does not render the action slot when not provided", async () => {
    await render(<SectionHeader label="Recent" testID="header" />);

    expect(screen.queryByTestId("header-action")).toBeNull();
  });

  it("renders the glyph before the label when an icon is given", async () => {
    await render(<SectionHeader icon="clock" label="Recent" testID="header" />);

    expect(screen.getByTestId("header-icon")).toBeTruthy();
    expect(screen.queryByTestId("header-rule")).toBeNull();
  });

  it("draws the rule in the rule variant", async () => {
    await render(<SectionHeader label="Recent" testID="header" variant="rule" />);

    expect(screen.getByTestId("header-rule")).toBeTruthy();
  });

  it("drops the rule when an action takes the right edge", async () => {
    await render(
      <SectionHeader
        action={<Text>See all</Text>}
        label="Recent"
        testID="header"
        variant="rule"
      />,
    );

    expect(screen.queryByTestId("header-rule")).toBeNull();
    expect(screen.getByTestId("header-action")).toBeTruthy();
  });
});
