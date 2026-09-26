/**
 * Bottom tab navigator for the authenticated app. The default React
 * Navigation tab bar is replaced by the custom {@link TabBar} component;
 * each tab owns its own nested native stack.
 */
import { useCallback } from "react";
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { StackActions } from "@react-navigation/native";

import { TabBar, type TabBarItem } from "@components/TabBar";

import { HistoryStack } from "./HistoryStack";
import { ProfileStack } from "./ProfileStack";
import { ProgressStack } from "./ProgressStack";
import { TodayStack } from "./TodayStack";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Tab destinations, in left-to-right order. Keys match route names. */
const TAB_ITEMS: TabBarItem[] = [
  { key: "TodayTab", label: "Today", icon: "today" },
  { key: "ProgressTab", label: "Progress", icon: "progress" },
  { key: "HistoryTab", label: "History", icon: "history" },
  { key: "ProfileTab", label: "Profile", icon: "profile" },
];

/**
 * Adapts React Navigation's tab bar props to {@link TabBar}. Emits the
 * standard `tabPress` event so listeners can still prevent a switch.
 *
 * Selecting a tab always lands on that tab's root screen: if its nested
 * stack was left deeper (e.g. Profile → Routines), it is popped to the top
 * before the tab is focused. Without this, the custom bar bypasses the
 * reset the default React Navigation tab bar performs on re-selection.
 */
export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const activeKey = state.routes[state.index]?.name ?? "";

  const handleSelect = useCallback(
    (key: string) => {
      const route = state.routes.find((item) => item.name === key);
      if (!route) return;

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (event.defaultPrevented) return;

      const nestedKey = route.state?.key;
      if (nestedKey) {
        navigation.dispatch({ ...StackActions.popToTop(), target: nestedKey });
      }

      if (state.routes[state.index]?.key !== route.key) {
        navigation.navigate(route.name);
      }
    },
    [navigation, state.index, state.routes],
  );

  return (
    <TabBar
      activeKey={activeKey}
      items={TAB_ITEMS}
      onSelect={handleSelect}
      testID="main-tab-bar"
    />
  );
}

/** The four-tab shell shown once the user is authenticated and onboarded. */
export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MainTabBar {...props} />}
    >
      <Tab.Screen name="TodayTab" component={TodayStack} />
      <Tab.Screen name="ProgressTab" component={ProgressStack} />
      <Tab.Screen name="HistoryTab" component={HistoryStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}
