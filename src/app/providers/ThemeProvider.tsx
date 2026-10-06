/**
 * Resolves the active color scheme and provides it to the tree.
 *
 * The user's Appearance choice wins; `system` follows the OS and updates
 * live. The choice is also pushed to the native side
 * (`Appearance.setColorScheme`) so system-drawn UI — alerts, the keyboard,
 * pickers — matches the app instead of the OS setting, and the root view's
 * background follows the canvas so no white flashes through transitions.
 */
import React, { useEffect, useMemo } from "react";
import { Appearance as NativeAppearance, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

import type { Appearance } from "@domain/entities";
import { useAppearanceStore } from "@features/profile/store";
import { palettes, ThemeContext, type ColorScheme, type Theme } from "@theme";

/** The scheme to render, given the user's choice and the OS setting. */
export function resolveScheme(
  appearance: Appearance,
  system: string | null | undefined,
): ColorScheme {
  if (appearance !== "system") return appearance;
  return system === "dark" ? "dark" : "light";
}

/** Provides the active theme and keeps native UI in step with it. */
export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const appearance = useAppearanceStore((state) => state.appearance);
  const system = useColorScheme();
  const scheme = resolveScheme(appearance, system);

  // Native side effects only — no data is fetched here.
  useEffect(() => {
    NativeAppearance.setColorScheme(appearance === "system" ? null : appearance);
  }, [appearance]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palettes[scheme].canvas);
  }, [scheme]);

  const theme = useMemo(
    (): Theme => ({ scheme, colors: palettes[scheme] }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={theme}>
      {children}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </ThemeContext.Provider>
  );
}
