import { render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default,
);

import { ACKNOWLEDGEMENTS } from "../acknowledgements";
import { AcknowledgementsScreen } from "../screens/AcknowledgementsScreen";

import type { ProfileStackParamList } from "@/app/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<ProfileStackParamList, "Acknowledgements">;

describe("AcknowledgementsScreen", () => {
  it("shows the attribution and license of every third-party source", () => {
    render(
      <AcknowledgementsScreen
        navigation={{ goBack: jest.fn() } as unknown as Props["navigation"]}
        route={{ key: "Acknowledgements", name: "Acknowledgements" } as Props["route"]}
      />,
    );

    for (const item of ACKNOWLEDGEMENTS) {
      expect(screen.getByTestId(`acknowledgement-${item.id}`)).toBeTruthy();
      expect(screen.getByText(item.attribution)).toBeTruthy();
      expect(screen.getByText(item.license)).toBeTruthy();
    }
  });
});
