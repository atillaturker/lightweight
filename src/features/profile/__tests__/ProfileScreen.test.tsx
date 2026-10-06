/**
 * Behavior test for Profile's sections.
 *
 * Routines moved to Home (Today tab), so the Profile Training section must
 * no longer offer a Routines row — its routes live in the Today stack now.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: () => undefined,
    set: () => undefined,
    remove: () => undefined,
  }),
}));

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default,
);

jest.mock("@features/auth", () => ({
  useAuthStore: (selector: (state: { user: unknown }) => unknown) =>
    selector({ user: null }),
  useSignInActions: () => ({ signOut: jest.fn() }),
}));

import { Alert, type AlertButton } from "react-native";

import { useHistoryStore } from "@features/history";
import { resetCloudSyncSeams, setCloudWorkoutDeleter } from "@features/history/services";

import { useAppearanceStore } from "../store";
import { ProfileScreen } from "../screens/ProfileScreen";

import type { ProfileStackParamList } from "@/app/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<ProfileStackParamList, "Profile">;

/** Renders the screen with a navigation double and returns the double. */
function renderProfile() {
  const navigation = { navigate: jest.fn() };
  render(
    <ProfileScreen
      navigation={navigation as unknown as Props["navigation"]}
      route={{ key: "Profile", name: "Profile" } as Props["route"]}
    />,
  );
  return navigation;
}

describe("ProfileScreen", () => {
  it("does not render a Routines row", () => {
    renderProfile();

    expect(screen.queryByTestId("profile-routines")).toBeNull();
    expect(screen.queryByText("Routines")).toBeNull();
  });

  it("still renders the Training section", () => {
    renderProfile();

    expect(screen.getByTestId("profile-training")).toBeTruthy();
    expect(screen.getByTestId("profile-units")).toBeTruthy();
  });

  it("opens Acknowledgements from the App section", () => {
    const navigation = renderProfile();

    fireEvent.press(screen.getByTestId("profile-acknowledgements"));

    expect(navigation.navigate).toHaveBeenCalledWith("Acknowledgements");
  });

  it("switches the app to dark from the Appearance sheet", () => {
    renderProfile();
    expect(screen.getByText("System")).toBeTruthy();

    fireEvent.press(screen.getByTestId("profile-appearance"));
    fireEvent.press(screen.getByText("Dark"));

    expect(useAppearanceStore.getState().appearance).toBe("dark");
  });

  it("deletes every workout and tombstones each after confirming", () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const deleteWorkoutFromCloud = jest.fn();
    setCloudWorkoutDeleter(deleteWorkoutFromCloud);
    const session = { id: "w1", routineId: null, routineName: "Push", startedAt: 5, finishedAt: 6, sets: [] };
    useHistoryStore.setState({ sessions: [session] });
    renderProfile();

    fireEvent.press(screen.getByTestId("profile-delete"));
    const buttons = alert.mock.calls[0][2] as AlertButton[];
    buttons.find((button) => button.style === "destructive")?.onPress?.();

    expect(useHistoryStore.getState().sessions).toEqual([]);
    expect(deleteWorkoutFromCloud).toHaveBeenCalledWith("w1", 5);
    alert.mockRestore();
    resetCloudSyncSeams();
  });
});
