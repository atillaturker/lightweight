import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { AppNavigator } from "./appNavigator";
import { AuthNavigator } from "./authNavigator";
import { SCREENS } from "./screenNames";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigation = () => {
  //Replace with actual authentication logic (e.g., from Context, Redux, or AsyncStorage)
  const isSignedIn = false;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <Stack.Screen name={SCREENS.APP} component={AppNavigator} />
        ) : (
          <Stack.Screen name={SCREENS.AUTH} component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
