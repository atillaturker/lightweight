/**
 * Behavior test for Profile's sections.
 *
 * Routines moved to Home (Today tab), so the Profile Training section must
 * no longer offer a Routines row — its routes live in the Today stack now.
 */
import { render, screen } from "@testing-library/react-native";
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

import { ProfileScreen } from "../screens/ProfileScreen";

describe("ProfileScreen", () => {
  it("does not render a Routines row", () => {
    render(<ProfileScreen />);

    expect(screen.queryByTestId("profile-routines")).toBeNull();
    expect(screen.queryByText("Routines")).toBeNull();
  });

  it("still renders the Training section", () => {
    render(<ProfileScreen />);

    expect(screen.getByTestId("profile-training")).toBeTruthy();
    expect(screen.getByTestId("profile-units")).toBeTruthy();
  });
});
