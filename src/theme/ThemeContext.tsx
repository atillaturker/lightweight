/**
 * The active theme and the two ways UI code reads it.
 *
 * - `useTheme()` returns `{ scheme, colors }` for colors used outside a
 *   stylesheet (SVG strokes, placeholder text colors).
 * - `createStyles((colors) => ({ ... }))`, called at module level, returns
 *   a `useStyles()` hook. The stylesheet is built once per scheme and
 *   cached, so switching themes costs one `StyleSheet.create` per module.
 *
 * The provider lives in `src/app/providers/ThemeProvider.tsx`. Without one
 * (tests, isolated renders) the light theme applies.
 */
import { createContext, useContext } from "react";
import { StyleSheet } from "react-native";

import {
  lightColors,
  type ColorPalette,
  type ColorScheme,
} from "./colors";

/** What {@link useTheme} returns. */
export interface Theme {
  scheme: ColorScheme;
  colors: ColorPalette;
}

const LIGHT_THEME: Theme = { scheme: "light", colors: lightColors };

/** Context carrying the active theme. Defaults to light. */
export const ThemeContext = createContext<Theme>(LIGHT_THEME);

/** The active scheme and palette. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * Build a theme-aware stylesheet hook. Call at module level:
 *
 *   const useStyles = createStyles((colors) => ({
 *     container: { backgroundColor: colors.canvas },
 *   }));
 *
 * then `const styles = useStyles();` at the top of the component.
 */
export function createStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ColorPalette) => T & StyleSheet.NamedStyles<T>,
): () => T {
  const cache = new Map<ColorScheme, T>();
  return function useStyles(): T {
    const { scheme, colors } = useTheme();
    let styles = cache.get(scheme);
    if (styles === undefined) {
      styles = StyleSheet.create(factory(colors));
      cache.set(scheme, styles);
    }
    return styles;
  };
}
