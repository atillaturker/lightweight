import type { NavigatorScreenParams } from "@react-navigation/native";
import { SCREENS } from "./screenNames";

export type RootStackParamList = {
  [SCREENS.APP_STACK]: undefined;
  [SCREENS.AUTH_STACK]: undefined;
};

export type AuthStackParamList = {
  [SCREENS.AUTH]: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList>;
  [SCREENS.ACTIVE_WORKOUT]: undefined;
  [SCREENS.EXERCISE_SELECTOR]: undefined;
  [SCREENS.ACTIVE_EXERCISE_DETAIL]: { exerciseInstanceId: string };
};

export type BottomTabParamList = {
  [SCREENS.TAB_HOME]: undefined;
  [SCREENS.TAB_WORKOUT]: undefined;
  [SCREENS.TAB_SETTINGS]: undefined;
};
