import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActiveExerciseDetailScreen,
  ActiveWorkoutScreen,
  ExerciseSelectorScreen,
  HomeScreen,
  WorkoutScreen,
} from "../screens/app";
import { SettingsScreen } from "../screens/app/SettingsScreen";
import { colors } from "../theme";
import { SCREENS } from "./screenNames";
import { AppStackParamList, BottomTabParamList } from "./types";

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.brand.primary,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarStyle: {
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            height: insets.bottom + 60,
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: colors.background.secondary,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            if (route.name === SCREENS.HOME) {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === SCREENS.SETTINGS) {
              iconName = focused ? "settings" : "settings-outline";
            } else if (route.name === SCREENS.WORKOUT) {
              iconName = focused ? "barbell" : "barbell-outline";
            } else {
              iconName = "alert";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        };
      }}
    >
      <Tab.Screen name={SCREENS.HOME} component={HomeScreen} />
      <Tab.Screen name={SCREENS.WORKOUT} component={WorkoutScreen} />
      <Tab.Screen name={SCREENS.SETTINGS} component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name={SCREENS.ACTIVE_WORKOUT}
        component={ActiveWorkoutScreen}
        options={{ presentation: "fullScreenModal", gestureEnabled: false }}
      />
      <Stack.Screen
        name={SCREENS.ACTIVE_EXERCISE_DETAIL}
        component={ActiveExerciseDetailScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name={SCREENS.EXERCISE_SELECTOR}
        component={ExerciseSelectorScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
};
