import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScreen, ProfileScreen } from "../screens/app";
import { SettingsScreen } from "../screens/app/SettingsScreen";
import { BottomTabParamList } from "./types";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          headerShown: false,
          tabBarActiveTintColor: "#FF6B6B",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            height: insets.bottom + 40,
            borderTopWidth: 0,
            elevation: 5,
            shadowOpacity: 0.1,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "barbell-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            } else {
              iconName = "alert";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
