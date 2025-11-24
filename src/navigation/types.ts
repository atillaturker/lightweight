import { SCREENS } from "./screenNames";

export type RootStackParamList = {
  [SCREENS.APP_STACK]: undefined;
  [SCREENS.AUTH_STACK]: undefined;
};

export type AuthStackParamList = {
  [SCREENS.AUTH]: undefined;
};

export type AppStackParamList = {
  [SCREENS.HOME]: undefined;
  [SCREENS.PROFILE]: undefined;
};
