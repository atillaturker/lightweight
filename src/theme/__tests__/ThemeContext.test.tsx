import { renderHook } from "@testing-library/react-native";
import React from "react";

import { darkColors, lightColors, palettes } from "../colors";
import { createStyles, ThemeContext, useTheme, type Theme } from "../ThemeContext";

const useStyles = createStyles((colors) => ({
  box: { backgroundColor: colors.canvas },
}));

const DARK: Theme = { scheme: "dark", colors: darkColors };

function darkWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={DARK}>{children}</ThemeContext.Provider>;
}

describe("useTheme", () => {
  it("falls back to the light theme without a provider", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.scheme).toBe("light");
    expect(result.current.colors).toBe(lightColors);
  });
});

describe("createStyles", () => {
  it("builds styles from the active palette", () => {
    const light = renderHook(() => useStyles());
    const dark = renderHook(() => useStyles(), { wrapper: darkWrapper });

    expect(light.result.current.box.backgroundColor).toBe(lightColors.canvas);
    expect(dark.result.current.box.backgroundColor).toBe(darkColors.canvas);
  });

  it("reuses one stylesheet per scheme", () => {
    const first = renderHook(() => useStyles(), { wrapper: darkWrapper });
    const second = renderHook(() => useStyles(), { wrapper: darkWrapper });
    expect(first.result.current).toBe(second.result.current);
  });
});

describe("palettes", () => {
  it("defines every token in both themes", () => {
    expect(Object.keys(palettes.dark).sort()).toEqual(Object.keys(palettes.light).sort());
  });
});
