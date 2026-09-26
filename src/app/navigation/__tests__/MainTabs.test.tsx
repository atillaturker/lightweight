/**
 * Behavior tests for the custom tab bar's select handler.
 *
 * The default React Navigation tab bar resets a nested stack to its root
 * when a tab is selected; the custom bar has to do that itself. These
 * tests pin the two cases that regressed: re-selecting the active Today
 * tab while it is deep in Routines, and switching to the Today tab after
 * its stack was left deep.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { StackActions } from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default,
);

// The stacks pull in Firebase-backed screens at import time; this suite
// only exercises the bar, so the tab destinations are stubbed out.
jest.mock("../TodayStack", () => ({ TodayStack: () => null }));
jest.mock("../ProgressStack", () => ({ ProgressStack: () => null }));
jest.mock("../HistoryStack", () => ({ HistoryStack: () => null }));
jest.mock("../ProfileStack", () => ({ ProfileStack: () => null }));

import { MainTabBar } from "../MainTabs";

/** Today route whose nested stack was left on "Routines". */
function todayRoute() {
  return {
    key: "today-key",
    name: "TodayTab",
    state: {
      key: "today-stack",
      index: 1,
      routes: [
        { key: "t-home", name: "HomeToday" },
        { key: "t-routines", name: "Routines" },
      ],
    },
  };
}

const PROFILE = { key: "profile-key", name: "ProfileTab" };
const PROGRESS = { key: "progress-key", name: "ProgressTab" };
const HISTORY = { key: "history-key", name: "HistoryTab" };

/** Build tab bar props with the given route order and focused index. */
function makeProps(routes: unknown[], index: number) {
  const state = { index, routes, routeNames: [], key: "tabs", type: "tab", stale: false };
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    navigate: jest.fn(),
    dispatch: jest.fn(),
  };
  return {
    props: { state, navigation } as unknown as BottomTabBarProps,
    navigation,
  };
}

describe("MainTabBar", () => {
  it("pops the Today stack to its root when the active tab is re-selected", () => {
    const { props, navigation } = makeProps(
      [todayRoute(), PROGRESS, HISTORY, PROFILE],
      0,
    );
    render(<MainTabBar {...props} />);

    fireEvent.press(screen.getByTestId("main-tab-bar-TodayTab"));

    expect(navigation.dispatch).toHaveBeenCalledWith({
      ...StackActions.popToTop(),
      target: "today-stack",
    });
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("resets a deep Today stack before switching to it", () => {
    const { props, navigation } = makeProps(
      [todayRoute(), PROGRESS, HISTORY, PROFILE],
      3,
    );
    render(<MainTabBar {...props} />);

    fireEvent.press(screen.getByTestId("main-tab-bar-TodayTab"));

    expect(navigation.dispatch).toHaveBeenCalledWith({
      ...StackActions.popToTop(),
      target: "today-stack",
    });
    expect(navigation.navigate).toHaveBeenCalledWith("TodayTab");
  });

  it("does not dispatch a reset for a tab that has no nested state", () => {
    const { props, navigation } = makeProps(
      [todayRoute(), PROGRESS, HISTORY, PROFILE],
      3,
    );
    render(<MainTabBar {...props} />);

    fireEvent.press(screen.getByTestId("main-tab-bar-HistoryTab"));

    expect(navigation.dispatch).not.toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith("HistoryTab");
  });
});
