import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { HomeScreen, ProfileScreen } from "../screens/app";
import { SCREENS } from "./screenNames";
import { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
      <Stack.Screen name={SCREENS.PROFILE} component={ProfileScreen} />
    </Stack.Navigator>
  );
};
