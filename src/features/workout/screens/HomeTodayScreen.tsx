/**
 * Home / Today — the entry point of the training loop.
 *
 * Three states share one layout:
 *
 * 1. **First run** — no routines and no history. The routines preview shows
 *    its empty state and the history sections are removed outright; the
 *    only primary action is creating a routine.
 * 2. **Active session** — Section 1 reframes as "IN PROGRESS" and the CTA
 *    becomes "Resume Workout".
 * 3. **Normal** — the next routine, the routines preview, the weekly strip,
 *    recent activity.
 *
 * The screen is a read model: `useHomeSummary` answers everything it
 * renders, and starting a session is delegated to `useWorkoutActions`.
 * Session history comes from the feature's history provider, which is
 * empty until the analytics batch registers a real source — so state 1 is
 * what renders today, and states 2 and 3 are what render once data exists.
 */
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { Routine } from "@domain/entities";
import { RoutineActionSheet } from "@features/routines/components/RoutineActionSheet";
import { colors, spacing } from "@theme";
import { useRoutineStore } from "@features/routines/store";
import type {
  MainTabParamList,
  TodayStackParamList,
} from "@/app/navigation/types";

import {
  HomeMyRoutines,
  HomeNextSession,
  HomeRecentActivity,
  HomeWeeklyStrip,
  TodayHeader,
} from "../components";
import { DEFAULT_WEEKLY_SESSION_GOAL } from "../config";
import { useActiveWorkout } from "../hooks/useActiveWorkout";
import { useHomeSummary } from "../hooks/useHomeSummary";
import { useWorkoutActions } from "../hooks/useWorkoutActions";
import { countCompletedSets, countTotalSets } from "../store";
import {
  countRoutineSets,
  estimateRoutineMinutes,
  toRecentSessionRow,
} from "../utils";
import { formatElapsedMinutes, formatTonnage } from "@lib/format";

/** Vertical gap between the three sections, per the Home spec. */
const SECTION_GAP = spacing.xxxl;

/** Gap between the header and Section 1. */
const HEADER_GAP = spacing.xxl;

type TodayNavigation = NativeStackNavigationProp<
  TodayStackParamList,
  "HomeToday"
>;
type TabNavigation = BottomTabNavigationProp<MainTabParamList>;

/**
 * Root screen of the Today tab: the daily brief, and the way into an
 * active session.
 */
export function HomeTodayScreen(): React.ReactElement {
  type HomeNav = TodayNavigation & TabNavigation;
  const navigation = useNavigation<HomeNav>();

  const { hasActiveSession, routineName, startedAt, exercises } =
    useActiveWorkout();
  const {
    nextRoutine,
    nextExercises,
    routines,
    activeRoutineId,
    hasHistory,
    weekly,
    recent,
  } = useHomeSummary();
  const { start } = useWorkoutActions();

  const setActiveRoutine = useRoutineStore((state) => state.setActiveRoutine);
  const deleteRoutine = useRoutineStore((state) => state.deleteRoutine);

  /** Routine whose action sheet is open, or `null` when none is. */
  const [actionRoutine, setActionRoutine] = useState<Routine | null>(null);

  /**
   * Captured once per render so every time-derived value on the screen
   * agrees, instead of each consumer sampling the clock independently.
   */
  const now = Date.now();

  /** Routines the user has saved; drives the Create Routine destination. */
  const routineCount = routines.length;

  /** Open the Routines list owned by the Today stack. */
  const openRoutines = useCallback((): void => {
    navigation.navigate("Routines");
  }, [navigation]);

  /** Open one routine in the editor. */
  const openRoutineEditor = useCallback(
    (routineId: string): void => {
      navigation.navigate("RoutineEditor", { routineId });
    },
    [navigation],
  );

  /**
   * "See all" on Recent activity belongs to the session list, which lives
   * in the History tab — not the Routines list.
   */
  const openHistory = useCallback((): void => {
    navigation.navigate("HistoryTab");
  }, [navigation]);

  /**
   * Create Routine goes straight to the editor when the user has no
   * routines yet — an empty list would be a dead end. With at least one
   * routine saved the list is the more useful destination.
   */
  const openCreateRoutine = useCallback((): void => {
    if (routineCount === 0) {
      navigation.navigate("RoutineEditor", {});
    } else {
      openRoutines();
    }
  }, [navigation, openRoutines, routineCount]);

  const openSession = useCallback(
    (sessionId: string): void => {
      navigation.navigate("WorkoutSummary", { sessionId });
    },
    [navigation],
  );

  const handleSetActiveRoutine = useCallback(
    (routineId: string): void => setActiveRoutine(routineId),
    [setActiveRoutine],
  );

  const handleEditRoutine = useCallback(
    (routineId: string): void => {
      navigation.navigate("RoutineEditor", { routineId });
    },
    [navigation],
  );

  const handleDeleteRoutine = useCallback(
    (routineId: string): void => deleteRoutine(routineId),
    [deleteRoutine],
  );


  const handlePrimaryAction = useCallback((): void => {
    if (hasActiveSession) {
      navigation.navigate("ActiveWorkout", {
        routineId: nextRoutine?.id ?? "",
      });
      return;
    }

    if (nextRoutine === null) {
      openCreateRoutine();
      return;
    }

    start(nextRoutine);
    navigation.navigate("ActiveWorkout", { routineId: nextRoutine.id });
  }, [
    hasActiveSession,
    navigation,
    nextRoutine,
    openCreateRoutine,
    start,
  ]);

  const recentRows = useMemo(
    () => recent.map((session) => toRecentSessionRow(session, now)),
    [recent, now],
  );

  /**
   * The first-run copy is for a user with nothing to start. That is any
   * user with no routine to train — regardless of history — because a
   * deleted or archived routine must not leave a blank title and a
   * "Start Workout" button behind. An open session keeps its own copy.
   */
  const showFirstRunCopy = !hasActiveSession && nextRoutine === null;

  /**
   * Sections 2 and 3 are about history, so they are removed entirely
   * until a session has been recorded.
   */
  const showHistorySections = hasHistory;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <TodayHeader testID="home-header" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="home-scroll"
      >
        <View style={styles.section}>
          <HomeNextSession
            ctaLabel={
              hasActiveSession
                ? "Resume Workout"
                : primaryLabel(showFirstRunCopy)
            }
            isLive={hasActiveSession}
            meta={nextSessionMeta({
              hasActiveSession,
              showFirstRun: showFirstRunCopy,
              startedAt,
              nextRoutineSets:
                nextRoutine === null ? 0 : countRoutineSets(nextRoutine),
              nextRoutineExercises: nextExercises.length,
              nextRoutineMinutes:
                nextRoutine === null ? 0 : estimateRoutineMinutes(nextRoutine),
              completedSets: countCompletedSets(exercises),
              totalSets: countTotalSets(exercises),
              now,
            })}
            onPress={handlePrimaryAction}
            overline={
              hasActiveSession
                ? "In progress"
                : showFirstRunCopy
                  ? "Get started"
                  : "Next session"
            }
            testID="home-next-session"
            title={titleFor({
              hasActiveSession,
              routineName,
              showFirstRun: showFirstRunCopy,
              nextRoutineName: nextRoutine?.name ?? "",
            })}
            footnote={
              showFirstRunCopy
                ? "No sessions yet. Your history will appear here."
                : undefined
            }
          />
        </View>

        <View style={styles.section}>
          <HomeMyRoutines
            activeRoutineId={activeRoutineId}
            onCreateRoutine={openCreateRoutine}
            onPressMore={setActionRoutine}
            onPressSeeAll={openRoutines}
            onSelectRoutine={openRoutineEditor}
            routines={routines}
            showCreateAction={!showFirstRunCopy}
            testID="home-my-routines"
          />
        </View>

        {showHistorySections ? (
          <>
            <View style={styles.section}>
              <HomeWeeklyStrip
                goal={DEFAULT_WEEKLY_SESSION_GOAL}
                sessionsThisWeek={weekly.sessionsThisWeek}
                streakWeeks={weekly.streakWeeks}
                testID="home-weekly-strip"
                volume={formatTonnage(weekly.volumeThisWeek)}
                volumeDeltaPercent={weekly.volumeDeltaPercent}
              />
            </View>

            <View style={styles.section}>
              <HomeRecentActivity
                onPressSeeAll={openHistory}
                onSelectSession={openSession}
                sessions={recentRows}
                testID="home-recent-activity"
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      <RoutineActionSheet
        isActive={actionRoutine?.id === activeRoutineId}
        onClose={() => setActionRoutine(null)}
        onDelete={handleDeleteRoutine}
        onEdit={handleEditRoutine}
        onSetActive={handleSetActiveRoutine}
        routine={actionRoutine}
        visible={actionRoutine !== null}
      />
    </SafeAreaView>
  );
}

/** CTA label for the first-run state. */
function primaryLabel(showFirstRun: boolean): string {
  return showFirstRun ? "Create Routine" : "Start Workout";
}

/** Section 1 title for the current state. */
function titleFor(input: {
  hasActiveSession: boolean;
  routineName: string;
  showFirstRun: boolean;
  nextRoutineName: string;
}): string {
  if (input.hasActiveSession) {
    return input.routineName === "" ? "Session" : input.routineName;
  }
  if (input.showFirstRun) return "Your first workout";
  return input.nextRoutineName;
}

/** Section 1 supporting line for the current state. */
function nextSessionMeta(input: {
  hasActiveSession: boolean;
  showFirstRun: boolean;
  startedAt: number | null;
  nextRoutineSets: number;
  nextRoutineExercises: number;
  nextRoutineMinutes: number;
  completedSets: number;
  totalSets: number;
  /** Render-pass timestamp, shared with the rest of the screen. */
  now: number;
}): string {
  if (input.hasActiveSession) {
    const elapsed =
      input.startedAt === null
        ? 0
        : formatElapsedMinutes(input.startedAt, input.now);
    return `Started ${elapsed} min ago · ${input.completedSets} of ${input.totalSets} sets`;
  }
  if (input.showFirstRun) {
    return "Create a routine to start tracking your lifts.";
  }
  return `${input.nextRoutineExercises} exercises · ~${input.nextRoutineMinutes} min`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingTop: HEADER_GAP,
    paddingBottom: spacing.huge,
  },
  section: {
    marginTop: SECTION_GAP,
  },
});
