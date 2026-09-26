/**
 * Behavior tests for the routine action sheet.
 *
 * The sheet is the single management surface for a routine row, shared by
 * Home and the Routines list. These tests pin the two rules callers rely
 * on: the active routine has no "Set as active" action, and Delete always
 * asks for confirmation before removing anything.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import type { Routine } from "@domain/entities";

import { RoutineActionSheet } from "../RoutineActionSheet";

/** A minimal routine for the sheet to act on. */
const ROUTINE: Routine = {
  id: "routine-1",
  name: "Upper / Lower",
  exercises: [],
  createdAt: 1,
  updatedAt: 1,
  isArchived: false,
};

/** Callback spies plus the default active (non-active) sheet props. */
function makeProps(isActive: boolean) {
  return {
    visible: true,
    routine: ROUTINE,
    isActive,
    onSetActive: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onClose: jest.fn(),
  };
}

describe("RoutineActionSheet", () => {
  it("calls onSetActive for Set as active", () => {
    const props = makeProps(false);
    render(<RoutineActionSheet {...props} />);

    fireEvent.press(screen.getByTestId("routine-action-set-active"));

    expect(props.onSetActive).toHaveBeenCalledWith(ROUTINE.id);
    expect(props.onClose).toHaveBeenCalled();
  });

  it("omits Set as active for the active routine", () => {
    render(<RoutineActionSheet {...makeProps(true)} />);

    expect(screen.queryByTestId("routine-action-set-active")).toBeNull();
    expect(screen.getByTestId("routine-action-edit")).toBeTruthy();
  });

  it("calls onEdit for Edit routine", () => {
    const props = makeProps(false);
    render(<RoutineActionSheet {...props} />);

    fireEvent.press(screen.getByTestId("routine-action-edit"));

    expect(props.onEdit).toHaveBeenCalledWith(ROUTINE.id);
    expect(props.onClose).toHaveBeenCalled();
  });

  it("confirms before deleting and calls onDelete on confirm", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const props = makeProps(false);
    render(<RoutineActionSheet {...props} />);

    fireEvent.press(screen.getByTestId("routine-action-delete"));

    expect(alertSpy).toHaveBeenCalled();
    expect(props.onDelete).not.toHaveBeenCalled();

    const buttons = alertSpy.mock.calls[0][2] ?? [];
    const destructive = buttons.find((button) => button.style === "destructive");
    destructive?.onPress?.();

    expect(props.onDelete).toHaveBeenCalledWith(ROUTINE.id);
    alertSpy.mockRestore();
  });
});
