import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { AuthScreen } from "../screens/auth";
import { SCREENS } from "./screenNames";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name={SCREENS.AUTH} component={AuthScreen} />
    </Stack.Navigator>
  );
};
