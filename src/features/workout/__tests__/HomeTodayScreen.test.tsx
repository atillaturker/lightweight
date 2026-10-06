/**
 * Behavior tests for Home's routines surface and the Recent activity
 * regression.
 *
 * Routines used to live only behind Profile; Home now previews them and
 * takes over their routes. These tests pin the discoverability rules:
 * the section shows only with routines, caps at three, and its rows open
 * the action sheet for management.
 */
import { fireEvent, render, screen, within } from "@testing-library/react-native";
import React from "react";

const mockNavigate = jest.fn();
const mockSetActiveRoutine = jest.fn();
const mockDeleteRoutine = jest.fn();
const mockMoveScheduledSession = jest.fn();

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

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return { ...actual, useNavigation: () => ({ navigate: mockNavigate }) };
});

jest.mock("@features/routines/store", () => ({
  useRoutineStore: (selector: (state: unknown) => unknown) =>
    selector({
      routines: [],
      activeRoutineId: null,
      setActiveRoutine: mockSetActiveRoutine,
      deleteRoutine: mockDeleteRoutine,
      scheduleOverrides: {},
      moveScheduledSession: mockMoveScheduledSession,
    }),
}));

jest.mock("../hooks/useActiveWorkout", () => ({
  useActiveWorkout: () => ({
    hasActiveSession: false,
    routineName: "",
    startedAt: null,
    exercises: [],
    sessionId: null,
    routineId: null,
    isResting: false,
    restEndsAt: null,
  }),
}));

interface MockSummary {
  nextRoutine: MockRoutine | null;
  plannedDate: number | null;
  weekPlan: {
    date: number;
    routineId: string | null;
    routineName: string | null;
    status: "done" | "today" | "missed" | "planned" | "rest";
    moved: boolean;
  }[];
  nextExercises: never[];
  routines: MockRoutine[];
  activeRoutineId: string | null;
  hasHistory: boolean;
  weekly: {
    sessionsThisWeek: number;
    volumeThisWeek: number;
    volumeLastWeek: number;
    volumeDeltaPercent: number | null;
    streakWeeks: number;
  };
  recent: {
    id: string;
    routineId: null;
    routineName: string;
    startedAt: number;
    finishedAt: number;
    sets: never[];
  }[];
}

interface MockRoutine {
  id: string;
  name: string;
  exercises: { exerciseId: string; targetSets: number; targetReps: number; order: number }[];
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  days?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
}

let mockSummary: MockSummary = makeSummary();

/** Build a summary with the given routines and history flag. */
function makeSummary(routines: MockRoutine[] = [], hasHistory = false): MockSummary {
  return {
    nextRoutine: routines[0] ?? null,
    plannedDate: null,
    weekPlan: [],
    nextExercises: [],
    routines,
    activeRoutineId: null,
    hasHistory,
    weekly: {
      sessionsThisWeek: 1,
      volumeThisWeek: 0,
      volumeLastWeek: 0,
      volumeDeltaPercent: null,
      streakWeeks: 1,
    },
    recent: hasHistory
      ? [
          {
            id: "session-1",
            routineId: null,
            routineName: "Push",
            startedAt: 1,
            finishedAt: 2,
            sets: [],
          },
        ]
      : [],
  };
}

/** A routine with the given id and optional active marking. */
function routine(id: string, name: string): MockRoutine {
  return {
    id,
    name,
    exercises: [{ exerciseId: "squat", targetSets: 3, targetReps: 8, order: 0 }],
    createdAt: 1,
    updatedAt: 1,
    isArchived: false,
  };
}

jest.mock("../hooks/useHomeSummary", () => ({
  useHomeSummary: () => mockSummary,
}));

jest.mock("../hooks/useWorkoutActions", () => ({
  useWorkoutActions: () => ({
    start: jest.fn(),
    finish: jest.fn(),
    discard: jest.fn(),
  }),
}));

import { HomeTodayScreen } from "../screens/HomeTodayScreen";

beforeEach(() => {
  mockNavigate.mockClear();
  mockSetActiveRoutine.mockClear();
  mockDeleteRoutine.mockClear();
  mockMoveScheduledSession.mockClear();
  mockSummary = makeSummary();
});

describe("HomeTodayScreen Recent activity", () => {
  it("navigates to the History tab when See all is pressed", () => {
    mockSummary = makeSummary([], true);
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-recent-activity-see-all"));

    expect(mockNavigate).toHaveBeenCalledWith("HistoryTab");
  });
});

describe("HomeTodayScreen empty routines", () => {
  it("shows the first-run copy and a Create Routine CTA when the routines list is empty", () => {
    mockSummary = makeSummary([], true);
    render(<HomeTodayScreen />);

    expect(screen.getByText("Your first workout")).toBeTruthy();
    expect(
      screen.getByText("Create a routine to start tracking your lifts."),
    ).toBeTruthy();
    expect(screen.getByTestId("home-next-session-cta")).toBeTruthy();
    expect(screen.queryByText("Start Workout")).toBeNull();
  });

  it("navigates to the routine editor with no params from the Create Routine CTA", () => {
    mockSummary = makeSummary([], true);
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-next-session-cta"));

    expect(mockNavigate).toHaveBeenCalledWith("RoutineEditor", {});
  });

  it("renders the standard next-session block when at least one routine exists", () => {
    mockSummary = makeSummary([routine("r1", "Upper / Lower")]);
    render(<HomeTodayScreen />);

    const nextSession = within(screen.getByTestId("home-next-session"));
    expect(nextSession.getByText("Upper / Lower")).toBeTruthy();
    expect(screen.getByText("Start Workout")).toBeTruthy();
    expect(screen.queryByText("Your first workout")).toBeNull();
  });

  it("starts the next routine from the Start Workout CTA", () => {
    mockSummary = makeSummary([routine("r1", "Upper / Lower")]);
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-next-session-cta"));

    expect(mockNavigate).toHaveBeenCalledWith("ActiveWorkout", {
      routineId: "r1",
    });
  });
});

describe("HomeTodayScreen My Routines", () => {
  it("renders the section when at least one routine exists", () => {
    mockSummary = makeSummary([routine("r1", "Upper / Lower")]);
    render(<HomeTodayScreen />);

    expect(screen.getByTestId("home-my-routines")).toBeTruthy();
    expect(screen.getByTestId("home-routine-row-r1")).toBeTruthy();
  });

  it("keeps the section visible with an empty state when there are no routines", () => {
    render(<HomeTodayScreen />);

    expect(screen.getByTestId("home-my-routines")).toBeTruthy();
    expect(screen.getByText("No routines yet")).toBeTruthy();
    expect(screen.queryByTestId("home-routine-row-r1")).toBeNull();
  });

  it("does not duplicate the first-run Create Routine CTA in the empty state", () => {
    render(<HomeTodayScreen />);

    expect(screen.queryByTestId("home-my-routines-empty-create")).toBeNull();
  });

  it("suppresses the empty-state create action when Next Session owns the CTA", () => {
    mockSummary = makeSummary([], true);
    render(<HomeTodayScreen />);

    expect(screen.queryByTestId("home-my-routines-empty-create")).toBeNull();
  });

  it("offers See all with a single routine, leading to the Routines list", () => {
    mockSummary = makeSummary([routine("r1", "Upper / Lower")]);
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-my-routines-see-all"));

    expect(mockNavigate).toHaveBeenCalledWith("Routines");
  });

  it("shows at most three routines and See all when more exist", () => {
    mockSummary = makeSummary([
      routine("r1", "One"),
      routine("r2", "Two"),
      routine("r3", "Three"),
      routine("r4", "Four"),
    ]);
    render(<HomeTodayScreen />);

    expect(screen.getByTestId("home-routine-row-r1")).toBeTruthy();
    expect(screen.getByTestId("home-routine-row-r3")).toBeTruthy();
    expect(screen.queryByTestId("home-routine-row-r4")).toBeNull();
    expect(screen.getByTestId("home-my-routines-see-all")).toBeTruthy();
  });

  it("navigates to the Routines route when See all is pressed", () => {
    mockSummary = makeSummary([
      routine("r1", "One"),
      routine("r2", "Two"),
      routine("r3", "Three"),
      routine("r4", "Four"),
    ]);
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-my-routines-see-all"));

    expect(mockNavigate).toHaveBeenCalledWith("Routines");
  });

  it("sets the routine active from the action sheet", () => {
    mockSummary = makeSummary([routine("r1", "Upper / Lower")]);
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-routine-row-r1-more"));
    fireEvent.press(screen.getByTestId("routine-action-set-active"));

    expect(mockSetActiveRoutine).toHaveBeenCalledWith("r1");
  });

  it("does not offer Set as active for the active routine", () => {
    mockSummary = makeSummary([routine("r1", "Upper / Lower")]);
    mockSummary.activeRoutineId = "r1";
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-routine-row-r1-more"));

    expect(screen.queryByTestId("routine-action-set-active")).toBeNull();
    expect(screen.getByTestId("routine-action-edit")).toBeTruthy();
  });
});

describe("HomeTodayScreen weekly plan", () => {
  /** Wednesday 7 October 2026, 10:00 local. */
  const NOW = new Date(2026, 9, 7, 10).getTime();
  const day = (date: number): number => new Date(2026, 9, date).getTime();

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /** A summary whose next routine is planned on `plannedDate`. */
  function plannedSummary(plannedDate: number): MockSummary {
    const pull = { ...routine("pull", "Pull"), days: [3] as MockRoutine["days"] };
    return {
      ...makeSummary([pull]),
      plannedDate,
      weekPlan: [5, 6, 7, 8, 9, 10, 11].map((date) => ({
        date: day(date),
        routineId: date === 7 ? "pull" : null,
        routineName: date === 7 ? "Pull" : null,
        status: date === 7 ? ("today" as const) : ("rest" as const),
        moved: false,
      })),
    };
  }

  it("labels a session planned for today", () => {
    mockSummary = plannedSummary(day(7));
    render(<HomeTodayScreen />);

    expect(screen.getByText("Today's session")).toBeTruthy();
  });

  it("names the weekday of a later planned session", () => {
    mockSummary = plannedSummary(day(9));
    render(<HomeTodayScreen />);

    expect(screen.getByText("Next session · Friday")).toBeTruthy();
  });

  it("hides the week plan without a weekly plan", () => {
    render(<HomeTodayScreen />);

    expect(screen.queryByTestId("home-week-plan")).toBeNull();
  });

  it("moves today's session to the chosen day from the sheet", () => {
    mockSummary = plannedSummary(day(7));
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-week-plan-day-3"));
    fireEvent.press(screen.getByTestId("move-session-target-5"));

    expect(mockMoveScheduledSession).toHaveBeenCalledWith(day(7), day(9), NOW);
  });

  it("does not open the sheet for a rest day", () => {
    mockSummary = plannedSummary(day(7));
    render(<HomeTodayScreen />);

    fireEvent.press(screen.getByTestId("home-week-plan-day-1"));

    expect(screen.queryByTestId("move-session-target-4")).toBeNull();
  });
});
