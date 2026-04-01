import { SCREENS } from "./screenNames";

export type RootStackParamList = {
  [SCREENS.APP_STACK]: undefined;
  [SCREENS.AUTH_STACK]: undefined;
};

export type AuthStackParamList = {
  [SCREENS.AUTH]: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  [SCREENS.ACTIVE_WORKOUT]: undefined;
  [SCREENS.EXERCISE_SELECTOR]: undefined;
  [SCREENS.ACTIVE_EXERCISE_DETAIL]: { exerciseInstanceId: string };
};

export type BottomTabParamList = {
  [SCREENS.HOME]: undefined;
  [SCREENS.WORKOUT]: undefined;
  [SCREENS.SETTINGS]: undefined;
};
