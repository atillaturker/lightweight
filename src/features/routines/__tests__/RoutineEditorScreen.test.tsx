/**
 * Regression test for the render-phase store write in the routine editor.
 *
 * The editor used to seed a new routine inside a `useState` initializer,
 * which runs during render. That wrote to the routine store mid-render and
 * synchronously notified every subscriber that was already mounted, which
 * React reported as:
 *
 *   Cannot update a component (`X`) while rendering a different component
 *   (`RoutineEditorScreen`).
 *
 * The reproduction depends on commit ordering. A subscriber rendered in the
 * same pass as the editor has not yet run its subscribe effect, so the write
 * is invisible to it and no warning fires. The warning appears only when a
 * subscriber is already mounted and committed — exactly the real case, where
 * HomeTodayScreen is on screen and the editor is pushed on top of it.
 *
 * The `Host` below delays the editor by one commit to reproduce that order.
 * A naive same-pass render passes against the bug, so that ordering is the
 * whole point of this harness.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React, { useEffect, useState } from "react";

// In-memory MMKV double, matching the auth store test pattern.
const mockMemory = new Map<string, string>();

jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => {
      mockMemory.set(key, value);
    },
    remove: (key: string) => {
      mockMemory.delete(key);
    },
  }),
}));

import { useRoutineStore } from "../store";
import { RoutineEditorScreen } from "../screens/RoutineEditorScreen";

import type { TodayStackParamList } from "@/app/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TodayStackParamList, "RoutineEditor">;

/** Minimal navigation double; only the members the editor touches. */
function makeNavigation() {
  return {
    goBack: jest.fn(),
    navigate: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn((_event: string, _listener: () => void) => () => undefined),
  };
}

/** Route double. `params` is all the editor reads. */
function makeRoute(routineId?: string): Props["route"] {
  return { params: routineId ? { routineId } : {} } as Props["route"];
}

/**
 * A sibling of the editor that subscribes to the routine list, standing in
 * for HomeTodayScreen's `useRoutineStore((s) => s.routines.length)`.
 */
function RoutineSubscriber(): React.ReactElement {
  useRoutineStore((state) => state.routines.length);
  return <></>;
}

/** Mounts the editor one commit later, mirroring a navigation push. */
function Host({ navigation }: { navigation: Props["navigation"] }): React.ReactElement {
  const [pushed, setPushed] = useState(false);

  useEffect(() => {
    setPushed(true);
  }, []);

  return (
    <>
      {pushed ? (
        <RoutineEditorScreen navigation={navigation} route={makeRoute()} />
      ) : null}
    </>
  );
}

/** Console messages captured during a render, filtered to React errors. */
function captureReactErrors(renderTree: () => void): string[] {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    renderTree();
    return spy.mock.calls.map((call) => String(call[0] ?? ""));
  } finally {
    spy.mockRestore();
  }
}

beforeEach(() => {
  mockMemory.clear();
  useRoutineStore.setState({ routines: [], activeRoutineId: null });
});

describe("RoutineEditorScreen create mode", () => {
  it("does not write to the store while rendering", () => {
    const navigation = makeNavigation() as unknown as Props["navigation"];

    const messages = captureReactErrors(() => {
      render(
        <>
          <RoutineSubscriber />
          <Host navigation={navigation} />
        </>,
      );
    });

    const renderWarning = messages.find((message) =>
      message.includes("Cannot update a component"),
    );

    expect(renderWarning).toBeUndefined();
  });

  it("seeds exactly one routine on mount", () => {
    const navigation = makeNavigation() as unknown as Props["navigation"];

    render(
      <>
        <RoutineSubscriber />
        <Host navigation={navigation} />
      </>,
    );

    expect(useRoutineStore.getState().routines).toHaveLength(1);
    expect(navigation.setParams).toHaveBeenCalledTimes(1);
  });

  it("does not seed a routine in edit mode", () => {
    const existingId = useRoutineStore.getState().createRoutine("Existing");
    const navigation = makeNavigation();

    render(
      <RoutineEditorScreen
        navigation={navigation as unknown as Props["navigation"]}
        route={makeRoute(existingId)}
      />,
    );

    expect(useRoutineStore.getState().routines).toHaveLength(1);
    expect(navigation.setParams).not.toHaveBeenCalled();
  });
});

describe("RoutineEditorScreen naming", () => {
  it("opens a new routine with an empty, focused name field", () => {
    const navigation = makeNavigation() as unknown as Props["navigation"];
    render(<RoutineEditorScreen navigation={navigation} route={makeRoute()} />);

    const input = screen.getByTestId("routine-name-input");
    expect(input.props.value).toBe("");
    expect(input.props.autoFocus).toBe(true);
  });

  it("keeps a name typed right before tapping Create routine", () => {
    const navigation = makeNavigation();
    render(
      <RoutineEditorScreen
        navigation={navigation as unknown as Props["navigation"]}
        route={makeRoute()}
      />,
    );

    // The footer button does not blur the field, so no onBlur fires here.
    fireEvent.changeText(screen.getByTestId("routine-name-input"), "Push Day");
    fireEvent.press(screen.getByTestId("routine-editor-submit"));

    const [routine] = useRoutineStore.getState().routines;
    expect(routine.name).toBe("Push Day");
    expect(navigation.goBack).toHaveBeenCalled();
  });
});

describe("RoutineEditorScreen supersets", () => {
  it("pairs an exercise with the next one from its target sheet", () => {
    const id = useRoutineStore.getState().createRoutine("Push");
    useRoutineStore.getState().addExercisesToRoutine(id, ["bench-press", "barbell-row"]);
    const navigation = makeNavigation();
    render(
      <RoutineEditorScreen
        navigation={navigation as unknown as Props["navigation"]}
        route={makeRoute(id)}
      />,
    );

    fireEvent.press(screen.getAllByLabelText("Target 3 by 8")[0]);
    fireEvent.press(screen.getByLabelText("Superset with next"));

    expect(screen.getByText(/Superset A1/)).toBeTruthy();
    expect(screen.getByText(/Superset A2/)).toBeTruthy();
  });
});

describe("RoutineEditorScreen leaving a new routine", () => {
  /** Render create mode and return the registered beforeRemove listener. */
  function renderCreate() {
    const navigation = makeNavigation();
    render(
      <RoutineEditorScreen
        navigation={navigation as unknown as Props["navigation"]}
        route={makeRoute()}
      />,
    );
    const call = navigation.addListener.mock.calls.find(([event]) => event === "beforeRemove");
    return { navigation, leave: () => call?.[1]() };
  }

  it("discards an empty routine when backing out", () => {
    const { leave } = renderCreate();
    expect(useRoutineStore.getState().routines).toHaveLength(1);

    leave();

    expect(useRoutineStore.getState().routines).toEqual([]);
  });

  it("keeps a routine that already has exercises", () => {
    const { leave } = renderCreate();
    const [routine] = useRoutineStore.getState().routines;
    useRoutineStore.getState().addExercisesToRoutine(routine.id, ["bench-press"]);

    leave();

    expect(useRoutineStore.getState().routines).toHaveLength(1);
  });

  it("keeps a routine created with the Create routine button", () => {
    const { leave } = renderCreate();

    fireEvent.press(screen.getByTestId("routine-editor-submit"));
    leave();

    expect(useRoutineStore.getState().routines).toHaveLength(1);
  });
});
