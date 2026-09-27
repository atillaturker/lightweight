import { render, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, Text } from "react-native";

import { colors } from "@theme";

import { Card } from "./Card";

describe("Card", () => {
  it("renders its children", async () => {
    await render(
      <Card testID="card">
        <Text>Bench press</Text>
      </Card>,
    );

    expect(screen.getByText("Bench press")).toBeTruthy();
  });

  it("draws a hairline border on the canvas by default", async () => {
    await render(
      <Card testID="card">
        <Text>x</Text>
      </Card>,
    );

    const style = StyleSheet.flatten(screen.getByTestId("card").props.style);
    expect(style.backgroundColor).toBe(colors.canvas);
    expect(style.borderColor).toBe(colors.hairline);
  });

  it("renders the well variant on the surface fill without a border", async () => {
    await render(
      <Card testID="card" variant="well">
        <Text>x</Text>
      </Card>,
    );

    const style = StyleSheet.flatten(screen.getByTestId("card").props.style);
    expect(style.backgroundColor).toBe(colors.surface);
    expect(style.borderWidth).toBeUndefined();
  });
});
