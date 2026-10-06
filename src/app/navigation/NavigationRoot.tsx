/**
 * Navigation container and theme. Mounted once at the app root; maps the
 * active palette onto React Navigation's theme so screen backgrounds and
 * transitions match the canvas in both light and dark.
 */
import { useMemo } from "react";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from "@react-navigation/native";

import { useTheme } from "@theme";

import { RootNavigator } from "./RootNavigator";

/** App-wide navigation root. */
export function NavigationRoot() {
  const { scheme, colors } = useTheme();

  const navTheme = useMemo((): NavigationTheme => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.canvas,
        card: colors.canvas,
        text: colors.textPrimary,
        border: colors.hairline,
        primary: colors.primary,
      },
    };
  }, [scheme, colors]);

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
