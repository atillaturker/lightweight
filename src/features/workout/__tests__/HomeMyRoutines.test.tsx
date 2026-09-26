/**
 * Behavior tests for Home's "My Routines" preview.
 *
 * The section header is the fixed landmark for routines on Home, so it must
 * survive an empty list. With routines it previews at most three, offers
 * "See all" beyond that, and never shows the empty state. The empty state's
 * create action is optional so the screen can avoid a duplicate CTA.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import type { Routine } from "@domain/entities";

import { HomeMyRoutines } from "../components/HomeMyRoutines";

/** A routine with one exercise so the meta line has a count. */
function routine(id: string, name: string): Routine {
  return {
    id,
    name,
    exercises: [
      { exerciseId: "squat", targetSets: 3, targetReps: 8, order: 0 },
    ],
    createdAt: 1,
    updatedAt: 1,
    isArchived: false,
  };
}

const ROUTINES = [
  routine("r1", "One"),
  routine("r2", "Two"),
  routine("r3", "Three"),
  routine("r4", "Four"),
];

describe("HomeMyRoutines empty state", () => {
  it("keeps the section header and shows the empty copy with no routines", () => {
    render(
      <HomeMyRoutines
        activeRoutineId={null}
        onCreateRoutine={jest.fn()}
        onPressMore={jest.fn()}
        onPressSeeAll={jest.fn()}
        onSelectRoutine={jest.fn()}
        routines={[]}
        showCreateAction
        testID="home-my-routines"
      />,
    );

    expect(screen.getByTestId("home-my-routines-header")).toBeTruthy();
    expect(screen.getByText("My Routines")).toBeTruthy();
    expect(screen.getByText("No routines yet")).toBeTruthy();
    expect(
      screen.getByText("Create one to start tracking your lifts."),
    ).toBeTruthy();
  });

  it("fires the create action from the empty state", () => {
    const onCreateRoutine = jest.fn();
    render(
      <HomeMyRoutines
        activeRoutineId={null}
        onCreateRoutine={onCreateRoutine}
        onPressMore={jest.fn()}
        onPressSeeAll={jest.fn()}
        onSelectRoutine={jest.fn()}
        routines={[]}
        showCreateAction
        testID="home-my-routines"
      />,
    );

    fireEvent.press(screen.getByTestId("home-my-routines-empty-create"));
    expect(onCreateRoutine).toHaveBeenCalled();
  });

  it("omits the create action when another CTA already covers it", () => {
    render(
      <HomeMyRoutines
        activeRoutineId={null}
        onCreateRoutine={jest.fn()}
        onPressMore={jest.fn()}
        onPressSeeAll={jest.fn()}
        onSelectRoutine={jest.fn()}
        routines={[]}
        showCreateAction={false}
        testID="home-my-routines"
      />,
    );

    expect(screen.queryByTestId("home-my-routines-empty-create")).toBeNull();
    expect(screen.getByText("No routines yet")).toBeTruthy();
  });
});

describe("HomeMyRoutines list", () => {
  it("previews at most three routines and offers See all beyond that", () => {
    const onPressSeeAll = jest.fn();
    render(
      <HomeMyRoutines
        activeRoutineId={null}
        onCreateRoutine={jest.fn()}
        onPressMore={jest.fn()}
        onPressSeeAll={onPressSeeAll}
        onSelectRoutine={jest.fn()}
        routines={ROUTINES}
        showCreateAction={false}
        testID="home-my-routines"
      />,
    );

    expect(screen.getByTestId("home-routine-row-r1")).toBeTruthy();
    expect(screen.getByTestId("home-routine-row-r3")).toBeTruthy();
    expect(screen.queryByTestId("home-routine-row-r4")).toBeNull();
    expect(screen.queryByText("No routines yet")).toBeNull();

    fireEvent.press(screen.getByTestId("home-my-routines-see-all"));
    expect(onPressSeeAll).toHaveBeenCalled();
  });

  it("marks only the active routine with the accent dot", () => {
    render(
      <HomeMyRoutines
        activeRoutineId="r2"
        onCreateRoutine={jest.fn()}
        onPressMore={jest.fn()}
        onPressSeeAll={jest.fn()}
        onSelectRoutine={jest.fn()}
        routines={ROUTINES}
        showCreateAction={false}
        testID="home-my-routines"
      />,
    );

    expect(screen.getAllByTestId("routine-active-dot")).toHaveLength(1);
  });

  it("opens the editor on a row tap and the sheet on the overflow action", () => {
    const onSelectRoutine = jest.fn();
    const onPressMore = jest.fn();
    render(
      <HomeMyRoutines
        activeRoutineId={null}
        onCreateRoutine={jest.fn()}
        onPressMore={onPressMore}
        onPressSeeAll={jest.fn()}
        onSelectRoutine={onSelectRoutine}
        routines={ROUTINES}
        showCreateAction={false}
        testID="home-my-routines"
      />,
    );

    fireEvent.press(screen.getByTestId("home-routine-row-r1"));
    expect(onSelectRoutine).toHaveBeenCalledWith("r1");

    fireEvent.press(screen.getByTestId("home-routine-row-r1-more"));
    expect(onPressMore).toHaveBeenCalledWith(ROUTINES[0]);
  });
});
