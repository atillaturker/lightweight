import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { styles } from "./Input.styles";
import { Input } from "./Input";

describe("Input", () => {
  it("renders the label above the field", async () => {
    await render(<Input label="Email" />);

    expect(screen.getByText("Email")).toBeTruthy();
  });

  it("forwards text changes through onChangeText", async () => {
    const onChangeText = jest.fn();
    await render(<Input onChangeText={onChangeText} testID="email" />);

    await fireEvent.changeText(screen.getByTestId("email"), "lifter@example.com");

    expect(onChangeText).toHaveBeenCalledWith("lifter@example.com");
  });

  it("shows the error message instead of the helper text", async () => {
    await render(
      <Input error="Enter a valid email" helperText="We never share it" />,
    );

    expect(screen.getByText("Enter a valid email")).toBeTruthy();
    expect(screen.queryByText("We never share it")).toBeNull();
  });

  it("flags the field as invalid for accessibility when errored", async () => {
    await render(<Input error="Required" testID="email" />);

    expect(screen.getByTestId("email").props["aria-invalid"]).toBe(true);
  });

  it("does not flag a valid field as invalid", async () => {
    await render(<Input testID="email" />);

    expect(screen.getByTestId("email").props["aria-invalid"]).toBeUndefined();
  });

  it("announces the error message politely", async () => {
    await render(<Input error="Required" />);

    expect(screen.getByText("Required").props["aria-live"]).toBe("polite");
  });

  it("blocks editing when not editable", async () => {
    await render(<Input editable={false} testID="email" />);

    expect(screen.getByTestId("email").props.editable).toBe(false);
  });

  it("applies the focus border style on focus", async () => {
    await render(<Input testID="email" />);
    const field = screen.getByTestId("email");

    await fireEvent(field, "focus");

    const flattened = field.props.style.flat().filter(Boolean);
    expect(flattened).toContainEqual(
      expect.objectContaining({ borderColor: "#111111" }),
    );
  });

  it("uses the default right padding when there is no accessory", async () => {
    await render(<Input testID="email" />);

    const field = screen.getByTestId("email");
    const flattened = field.props.style.flat().filter(Boolean);

    expect(flattened).not.toContainEqual(
      expect.objectContaining({ paddingRight: 44 }),
    );
  });

  it("renders the right accessory when provided", async () => {
    await render(
      <Input
        rightAccessory={<Text>👁</Text>}
        testID="email"
      />,
    );

    expect(screen.getByText("👁")).toBeTruthy();
    expect(screen.getByTestId("email")).toBeTruthy();
  });

  it("does not render an accessory container when none is provided", async () => {
    await render(<Input testID="email" />);

    expect(screen.queryByText("👁")).toBeNull();
  });

  it("reserves extra right padding for the text input when an accessory is present", async () => {
    await render(
      <Input
        rightAccessory={<Text>👁</Text>}
        testID="email"
      />,
    );

    const field = screen.getByTestId("email");
    const flattened = field.props.style.flat().filter(Boolean);

    expect(flattened).toContainEqual(
      expect.objectContaining({ paddingRight: 44 }),
    );
  });

  it("keeps the accessory right-aligned 12px from the field edge", async () => {
    await render(
      <Input rightAccessory={<Text>👁</Text>} testID="email" />,
    );

    expect(styles.accessory).toEqual(
      expect.objectContaining({ right: 12, position: "absolute" }),
    );
  });
});
