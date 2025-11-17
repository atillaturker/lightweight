import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { LoginScreen, RegisterScreen } from "../screens/auth";
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
      <Stack.Screen
        name={SCREENS.REGISTER}
        component={RegisterScreen}
        options={{ title: "Sign Up" }}
      />
      <Stack.Screen
        name={SCREENS.LOGIN}
        component={LoginScreen}
        options={{ title: "Login" }}
      />
    </Stack.Navigator>
  );
};
