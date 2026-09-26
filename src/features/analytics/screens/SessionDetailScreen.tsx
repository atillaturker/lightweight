/**
 * Session Detail — a read-only record of one past workout.
 *
 * Reached from the History list, and addressable by any route that carries a
 * `sessionId`. The session is resolved from the durable history store (not
 * the summary hand-off), so older sessions render too. The screen is a read
 * model: figures come from `@domain/rules`, the exercise table is the Active
 * Workout table in its read-only variant, and the PR section matches the
 * Summary screen.
 *
 * "Repeat this workout" starts a fresh session from the same routine and
 * opens Active Workout; it is the single primary action. The header's "⋯"
 * offers the only destructive action.
 */
import React, { useCallback } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, gutter, spacing, type } from "@theme";
import {
  formatInteger,
  formatLongDateTime,
  formatTonnage,
} from "@lib/format";
import { useRoutineStore } from "@features/routines/store";
import { useSessionActions } from "@features/history/hooks";
import {
  MoreGlyph,
  PRSection,
  StatColumn,
  StatStrip,
  useActiveWorkout,
  useWorkoutActions,
} from "@features/workout";

import { SessionExerciseBlock } from "../components";
import { useSessionDetail } from "../hooks";

import type { HistoryStackParamList, MainTabParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<HistoryStackParamList, "SessionDetail">;

/** Vertical distance between the summary sections. */
const SECTION_GAP = spacing.xxxl;

/** Gap between the header and the top block. */
const CONTENT_TOP = spacing.xxl;

/** Rendered edge length of the header overflow glyph. */
const MORE_GLYPH_SIZE = 20;

/**
 * Read-only recap of a finished session, with a repeat CTA. When the id no
 * longer resolves, the screen says so rather than rendering blanks.
 */
export function SessionDetailScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const { sessionId } = route.params;
  const { session, volumeKg, sets, reps, minutes, exercises, personalRecords } =
    useSessionDetail(sessionId);
  const routines = useRoutineStore((state) => state.routines);
  const { removeSession } = useSessionActions();
  const { hasActiveSession } = useActiveWorkout();
  const { start } = useWorkoutActions();

  const handleOverflow = useCallback((): void => {
    Alert.alert("Session options", undefined, [
      {
        text: "Delete session",
        style: "destructive",
        onPress: () => {
          removeSession(sessionId);
          navigation.goBack();
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [navigation, removeSession, sessionId]);

  const handleRepeat = useCallback((): void => {
    const routineId = session?.routineId ?? null;
    const routine =
      routineId === null
        ? undefined
        : routines.find((entry) => entry.id === routineId);

    if (routine === undefined) {
      Alert.alert("Routine unavailable", "This workout's routine no longer exists.");
      return;
    }
    if (hasActiveSession) {
      Alert.alert(
        "Workout in progress",
        "Finish or discard your active workout first.",
      );
      return;
    }

    start(routine);
    const tabs = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    tabs?.navigate("TodayTab", {
      screen: "ActiveWorkout",
      params: { routineId: routine.id },
    });
  }, [hasActiveSession, navigation, routines, session, start]);

  const header = (
    <ScreenHeader
      showBack
      onBack={navigation.goBack}
      rightAction={
        <Pressable
          accessibilityLabel="Session options"
          accessibilityRole="button"
          hitSlop={spacing.xs}
          onPress={handleOverflow}
          style={styles.overflow}
          testID="session-detail-more"
        >
          <MoreGlyph size={MORE_GLYPH_SIZE} />
        </Pressable>
      }
      testID="session-detail-header"
    />
  );

  if (session === null) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        {header}
        <View style={styles.centered}>
          <EmptyState
            action={
              <Button
                label="Back to History"
                onPress={navigation.goBack}
                testID="session-detail-missing-back"
                variant="secondary"
              />
            }
            message="This session is no longer on this device."
            testID="session-detail-missing"
            title="Session not found"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {header}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="session-detail-scroll"
      >
        <Text style={styles.overline}>Session</Text>
        <Text style={styles.headline}>
          {session.routineName === "" ? "Session" : session.routineName}
        </Text>
        <Text style={styles.meta}>{formatLongDateTime(session.startedAt)}</Text>

        <View style={styles.section}>
          <StatStrip>
            <StatColumn
              label="Volume"
              testID="session-detail-volume"
              value={formatTonnage(volumeKg)}
            />
            <StatColumn
              label="Sets"
              testID="session-detail-sets"
              value={formatInteger(sets)}
            />
            <StatColumn
              label="Reps"
              testID="session-detail-reps"
              value={formatInteger(reps)}
            />
            <StatColumn
              caption="min"
              label="Time"
              testID="session-detail-time"
              value={formatInteger(minutes)}
            />
          </StatStrip>
        </View>

        <View style={styles.section}>
          {exercises.map((block, index) => (
            <View
              key={block.exercise.exerciseId}
              style={index === 0 ? null : styles.block}
            >
              <SessionExerciseBlock
                block={block}
                onPress={() =>
                  navigation.navigate("ExerciseDetailFromHistory", {
                    exerciseId: block.exercise.exerciseId,
                  })
                }
                testID={`session-detail-block-${index}`}
              />
            </View>
          ))}
        </View>

        {personalRecords.length > 0 ? (
          <View style={styles.section}>
            <PRSection rows={personalRecords} testID="session-detail-prs" />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          fullWidth
          label="Repeat this workout"
          onPress={handleRepeat}
          testID="session-detail-repeat"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  overflow: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    paddingTop: CONTENT_TOP,
    paddingBottom: spacing.huge,
    paddingHorizontal: gutter,
  },
  overline: {
    ...type.labelSmall,
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  headline: {
    ...type.display,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  meta: {
    ...type.body,
    fontSize: 14,
    marginTop: spacing.xs + 2,
    color: colors.textMuted,
  },
  section: {
    marginTop: SECTION_GAP,
  },
  block: {
    marginTop: SECTION_GAP,
  },
  footer: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
