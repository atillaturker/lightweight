import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import LoadingScreen from "../screens/auth/LoadingScreen";
import { auth } from "../services/firebase";
import { AppNavigator } from "./appNavigator";
import { AuthNavigator } from "./authNavigator";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigation = () => {
  //Replace with actual authentication logic (e.g., from Context, Redux, or AsyncStorage)
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Simulate checking authentication status this could be replaced with real logic
    const subscriber = onAuthStateChanged(auth, (currentUser) => {
      setIsSignedIn(!!currentUser);
      setLoading(false);
    });
    return subscriber; // Unsubscribe on unmount
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          <Stack.Screen name="AuthLoading" component={LoadingScreen} />
        ) : isSignedIn ? (
          <Stack.Screen name="AppNavigator" component={AppNavigator} />
        ) : (
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
