/**
 * Navigation container and theme. Mounted once at the app root; maps the
 * design-system color tokens onto React Navigation's theme so screen
 * backgrounds and transitions match the canvas.
 */
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";

import { colors } from "@theme";

import { RootNavigator } from "./RootNavigator";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.canvas,
    card: colors.canvas,
    text: colors.textPrimary,
    border: colors.hairline,
    primary: colors.primary,
  },
};

/** App-wide navigation root. */
export function NavigationRoot() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
