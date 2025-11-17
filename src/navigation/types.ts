import { SCREENS } from "./screenNames";

export type RootStackParamList = {
  [SCREENS.APP]: undefined;
  [SCREENS.AUTH]: undefined;
};

export type AuthStackParamList = {
  [SCREENS.LOGIN]: undefined;
  [SCREENS.REGISTER]: undefined;
};

export type AppStackParamList = {
  [SCREENS.HOME]: undefined;
  [SCREENS.PROFILE]: undefined;
};
