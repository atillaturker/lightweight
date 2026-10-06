import { act, render, screen } from "@testing-library/react-native";
import React from "react";
import { Appearance, Text } from "react-native";

jest.mock("expo-system-ui", () => ({ setBackgroundColorAsync: jest.fn(async () => undefined) }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));

import { useAppearanceStore } from "@features/profile/store";
import { darkColors, lightColors, useTheme } from "@theme";

import { resolveScheme, ThemeProvider } from "../ThemeProvider";

/** Prints the active scheme and canvas color. */
function Probe(): React.ReactElement {
  const { scheme, colors } = useTheme();
  return <Text testID="probe">{`${scheme} ${colors.canvas}`}</Text>;
}

describe("resolveScheme", () => {
  it("lets an explicit choice win over the OS", () => {
    expect(resolveScheme("dark", "light")).toBe("dark");
    expect(resolveScheme("light", "dark")).toBe("light");
  });

  it("follows the OS for system", () => {
    expect(resolveScheme("system", "dark")).toBe("dark");
    expect(resolveScheme("system", "light")).toBe("light");
  });

  it("falls back to light when the OS reports nothing", () => {
    expect(resolveScheme("system", null)).toBe("light");
  });
});

describe("ThemeProvider", () => {
  // The native call would emit an appearance change outside act().
  let setColorScheme: jest.SpyInstance;
  beforeEach(() => {
    setColorScheme = jest.spyOn(Appearance, "setColorScheme").mockImplementation(() => {});
    // Reset before render, not after: a reset while the tree is still
    // mounted re-renders it outside act().
    useAppearanceStore.setState({ appearance: "system" });
  });
  afterEach(() => setColorScheme.mockRestore());

  /** Render, then let effects and the store's async hydration settle. */
  async function renderProvider(): Promise<void> {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await act(async () => {});
  }

  it("provides the dark palette when the user picks Dark", async () => {
    useAppearanceStore.setState({ appearance: "dark" });

    await renderProvider();

    expect(screen.getByTestId("probe")).toHaveTextContent(`dark ${darkColors.canvas}`);
    expect(setColorScheme).toHaveBeenCalledWith("dark");
  });

  it("provides the light palette when the user picks Light", async () => {
    useAppearanceStore.setState({ appearance: "light" });

    await renderProvider();

    expect(screen.getByTestId("probe")).toHaveTextContent(`light ${lightColors.canvas}`);
  });
});
