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
});
