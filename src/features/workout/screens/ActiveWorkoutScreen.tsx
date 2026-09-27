/**
 * Active Workout — the set table, in focused mode.
 *
 * The screen is one scroll view of exercise blocks with a fixed header, a
 * 2px session progress bar, and a pinned CTA. There is no bottom tab bar
 * and no "save" button: every tap writes straight through to the store,
 * which writes straight through to MMKV.
 *
 * Three design frames are renderable. The live frame (no `preview` prop)
 * is what ships. `preview="keyboard"` and `preview="pr"` render the two
 * reference frames: the keyboard frame drafts the third set's kilo cell so
 * the CTA reads "Next", and the PR frame completes the leading sets so the
 * record pill and the following active row are visible. Both previews are
 * inert — every mutating handler returns early when a preview is active,
 * and the frame's data comes from `workoutPreview` rather than the store.
 *
 * Closing with the header's × opens the Finish / Discard sheet instead of
 * silently discarding the session.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { colors, gutter, spacing, type } from '@theme';
import { formatClock } from '@lib/format';
import type { TodayStackParamList } from '@/app/navigation/types';

import { ExerciseBlock } from '../components/ExerciseBlock';
import { ProgressLine } from '../components/ProgressLine';
import { TODAY_HEADER_HEIGHT, TodayWorkoutHeader } from '../components/WorkoutHeaders';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useCellReveal } from '../hooks/useCellReveal';
import { useRestTimerLine } from '../hooks/useRestTimerLine';
import { useSetLogger } from '../hooks/useSetLogger';
import {
  findActiveSet,
  firstIncompleteSet,
  nextCell,
  useSetTableDraft,
} from '../hooks/useSetTableDraft';
import { useWorkoutActions } from '../hooks/useWorkoutActions';
import { countCompletedSets, countTotalSets } from '../store';
import type {
  ActiveExercise,
  ActiveSet,
  ActiveWorkoutPreview,
  FocusedCell,
} from '../types';
import { lastTimeLine } from '../utils/lastPerformance';
import { getExerciseHistory, getRestTimerSeconds } from '../services';
import { PREVIEW_LAST_TIME, resolveFrameExercises } from '../utils/workoutPreview';
type Props = NativeStackScreenProps<TodayStackParamList, 'ActiveWorkout'>;

/**
 * Screen properties. `preview` exists only so the design's reference
 * frames can be rendered in isolation; the app never passes it.
 */
export interface ActiveWorkoutScreenProps extends Props {
  preview?: ActiveWorkoutPreview;
}

/** Vertical distance between two exercise blocks. */
const BLOCK_GAP = spacing.lg;

/** Gap between the header and the first block. */
const CONTENT_TOP = spacing.xxl;

/** The focused cell shown in the keyboard reference frame. */
const PREVIEW_KEYBOARD_CELL_INDEX = 2;

/**
 * Screen where sets are logged. Owns the draft cell, the rest line, the
 * session progress bar, and the exit sheet.
 */
export function ActiveWorkoutScreen({
  navigation,
  preview,
}: ActiveWorkoutScreenProps): React.ReactElement {
  const { routineName, startedAt, exercises: liveExercises, hasActiveSession } =
    useActiveWorkout();
  const { completeSet, updateSet, addSet } = useSetLogger();
  const rest = useRestTimerLine();
  const { finish, discard } = useWorkoutActions();
  const [isExitSheetOpen, setExitSheetOpen] = useState(false);

  const isPreview = preview !== undefined;
  const exercises = useMemo(
    () => resolveFrameExercises(liveExercises, preview),
    [liveExercises, preview],
  );

  const handleCommit = useCallback(
    (cell: FocusedCell, value: number): void => {
      if (isPreview) return;
      const exerciseId = findExerciseId(exercises, cell.setId);
      if (exerciseId === null) return;
      updateSet(
        exerciseId,
        cell.setId,
        cell.field === 'weight' ? { weightKg: value } : { reps: value },
      );
    },
    [exercises, isPreview, updateSet],
  );

  const draft = useSetTableDraft(handleCommit);

  const focusedCell: FocusedCell | null = isPreview
    ? previewKeyboardCell(preview, exercises)
    : draft.focusedCell;

  const reveal = useCellReveal(focusedCell);

  const totalSets = countTotalSets(exercises);
  const completedSets = countCompletedSets(exercises);
  const firstIncomplete = useMemo(
    () => firstIncompleteSet(exercises),
    [exercises],
  );
  const isCtaDisabled =
    !isPreview && focusedCell === null && firstIncomplete === null;
  const ctaLabel =
    focusedCell !== null
      ? 'Next'
      : !isPreview && firstIncomplete === null
        ? 'All sets done'
        : 'Log set';

  const handleFocusCell = useCallback(
    (cell: FocusedCell): void => {
      if (isPreview) return;
      const current = findSet(exercises, cell.setId);
      if (current === null) return;
      const actual = cell.field === 'weight' ? current.weightKg : current.reps;
      draft.focusCell(cell, actual);
    },
    [draft, exercises, isPreview],
  );

  const handleToggleComplete = useCallback(
    (setId: string): void => {
      if (isPreview) return;
      const exerciseId = findExerciseId(exercises, setId);
      const current = findSet(exercises, setId);
      if (exerciseId === null || current === null) return;

      if (current.completed) {
        updateSet(exerciseId, setId, { completed: false, completedAt: null });
        return;
      }
      completeSet(exerciseId, setId);
      rest.start(getRestTimerSeconds());
    },
    [completeSet, exercises, isPreview, rest, updateSet],
  );

  /** Commit the draft and advance to the next numeric cell, if any. */
  const handleAdvance = useCallback((): void => {
    const cell = draft.focusedCell;
    if (isPreview || cell === null) return;

    const following = nextCell(exercises, cell);
    draft.commit();
    if (following === null) return;

    const current = findSet(exercises, following.setId);
    if (current === null) return;
    const actual =
      following.field === 'weight' ? current.weightKg : current.reps;
    draft.focusCell(following, actual);
  }, [draft, exercises, isPreview]);

  /**
   * The single primary action. With a cell drafted it advances to the next
   * cell; with no cell drafted it completes the first incomplete set — so
   * "Log set" always logs something rather than returning silently.
   */
  const handlePrimary = useCallback((): void => {
    if (isPreview) return;

    if (draft.focusedCell !== null) {
      handleAdvance();
      return;
    }

    if (firstIncomplete === null) return;
    completeSet(firstIncomplete.exerciseId, firstIncomplete.setId);
    rest.start(getRestTimerSeconds());
  }, [completeSet, draft.focusedCell, firstIncomplete, handleAdvance, isPreview, rest]);

  const handleExitChoice = useCallback(
    (choice: 'finish' | 'discard'): void => {
      setExitSheetOpen(false);
      if (choice === 'finish') {
        const workout = finish();
        navigation.replace('WorkoutSummary', { sessionId: workout.id });
      } else {
        discard();
        navigation.popToTop();
      }
    },
    [discard, finish, navigation],
  );

  if (!hasActiveSession && !isPreview) {
    return (
      <NoActiveSession navigation={navigation} />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <TodayWorkoutHeader
        onClose={isPreview ? noop : () => setExitSheetOpen(true)}
        onFinish={isPreview ? noop : () => setExitSheetOpen(true)}
        testID="active-workout-header"
        title={routineName === '' ? 'Workout' : routineName}
      />

      <ProgressLine
        ratio={totalSets === 0 ? 0 : completedSets / totalSets}
        testID="active-workout-progress"
      />

      {/*
        The rest timer is a thin line under the session bar — never an
        overlay card. The label sits beside it because two stacked bars
        would otherwise be ambiguous.
      */}
      {rest.isResting ? (
        <View style={styles.restRow} testID="active-workout-rest">
          <Text style={styles.restLabel} testID="active-workout-rest-label">
            {`Rest ${rest.label}`}
          </Text>
          <View style={styles.restBar}>
            <ProgressLine
              ratio={rest.ratio}
              testID="active-workout-rest-bar"
            />
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={TODAY_HEADER_HEIGHT}
        style={styles.flex}
        testID="active-workout-keyboard"
      >
        <ScrollView
          contentContainerStyle={styles.content}
          innerViewRef={reveal.innerViewRef}
          keyboardShouldPersistTaps="handled"
          onLayout={reveal.onLayout}
          onScroll={reveal.onScroll}
          ref={reveal.scrollRef}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          testID="active-workout-scroll"
        >
          {exercises.map((exercise, index) => (
            <View key={exercise.exerciseId} style={index === 0 ? null : styles.block}>
              <ExerciseBlock
                activeSetId={findActiveSet(exercise)?.id ?? null}
                displayValue={draft.displayValue}
                exercise={exercise}
                focusedCell={focusedCell}
                lastTimeLine={resolveLastTimeLine(exercise, isPreview)}
                onAddSet={() => addSet(exercise.exerciseId)}
                onFocusCell={handleFocusCell}
                onPressMore={noop}
                onToggleComplete={handleToggleComplete}
                registerRowRef={reveal.registerRowRef}
                testID={`active-workout-block-${index}`}
              />
            </View>
          ))}
        </ScrollView>

        {/*
          Off-screen field that owns keyboard focus. Zero opacity rather
          than `display: none` — a hidden input cannot hold focus.
        */}
        <TextInput
          accessibilityLabel="Set value"
          caretHidden
          keyboardType="numeric"
          onChangeText={draft.changeDraft}
          onSubmitEditing={draft.commit}
          ref={draft.inputRef}
          style={styles.hiddenInput}
          testID="active-workout-input"
          value={draft.draftValue}
        />

        {/*
          The primary CTA is hidden while the exit sheet is open: the sheet
          carries its own primary action, and a screen may only ever show
          one.
        */}
        {isExitSheetOpen ? null : (
          <View style={styles.footer}>
            <Button
              disabled={isCtaDisabled}
              fullWidth
              label={ctaLabel}
              onPress={handlePrimary}
              testID="active-workout-cta"
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {isExitSheetOpen ? (
        <ExitSheet
          onChoose={handleExitChoice}
          onDismiss={() => setExitSheetOpen(false)}
          startedAt={startedAt}
          testID="active-workout-exit"
        />
      ) : null}
    </SafeAreaView>
  );
}

/** No-op handler for affordances that gain behavior in a later batch. */
function noop(): void {
  return undefined;
}

/** The keyboard frame's focused cell, or `null` for every other frame. */
function previewKeyboardCell(
  preview: ActiveWorkoutPreview | undefined,
  exercises: ActiveExercise[],
): FocusedCell | null {
  if (preview !== 'keyboard') return null;
  const target =
    exercises[0]?.sets[PREVIEW_KEYBOARD_CELL_INDEX] ?? exercises[0]?.sets[0];
  return target === undefined ? null : { setId: target.id, field: 'weight' };
}

/** History line for a block: preview data in a frame, real history live. */
function resolveLastTimeLine(
  exercise: ActiveExercise,
  isPreview: boolean,
): string | null {
  if (isPreview) return PREVIEW_LAST_TIME;
  return lastTimeLine(getExerciseHistory(exercise.exerciseId));
}

/** Find which exercise owns a set id, or `null`. */
function findExerciseId(
  exercises: ActiveExercise[],
  setId: string,
): string | null {
  for (const block of exercises) {
    if (block.sets.some((set) => set.id === setId)) return block.exerciseId;
  }
  return null;
}

/** Find a set by id across the whole table, or `null`. */
function findSet(
  exercises: ActiveExercise[],
  setId: string,
): ActiveSet | null {
  for (const block of exercises) {
    const found = block.sets.find((set) => set.id === setId);
    if (found !== undefined) return found;
  }
  return null;
}

/** Shown when the route is reached with no session open. */
function NoActiveSession({
  navigation,
}: {
  navigation: Props['navigation'];
}): React.ReactElement {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <TodayWorkoutHeader
        onClose={navigation.popToTop}
        onFinish={navigation.popToTop}
        testID="active-workout-header"
        title="Workout"
      />
      <View style={styles.fallback}>
        <EmptyState
          action={
            <Button
              label="Back to Today"
              onPress={navigation.popToTop}
              testID="active-workout-fallback-back"
              variant="secondary"
            />
          }
          message="Start a workout from Today to log sets."
          testID="active-workout-fallback"
          title="No active workout"
        />
      </View>
    </SafeAreaView>
  );
}

/** Props for {@link ExitSheet}. */
interface ExitSheetProps {
  /** Called with the chosen exit action. */
  onChoose: (choice: 'finish' | 'discard') => void;
  /** Called when the sheet is dismissed without choosing. */
  onDismiss: () => void;
  /** Session start time, used for the elapsed line. */
  startedAt: number | null;
  testID?: string;
}

/**
 * Exit sheet for an open session. Offers Finish and Discard plus an
 * explicit "Keep training" escape, so closing is never a silent loss.
 */
function ExitSheet({
  onChoose,
  onDismiss,
  startedAt,
  testID,
}: ExitSheetProps): React.ReactElement {
  const elapsed =
    startedAt === null
      ? ''
      : `${formatClock((Date.now() - startedAt) / 1000)} elapsed. `;

  return (
    <View style={styles.sheetOverlay} testID={testID}>
      <Pressable
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
        onPress={onDismiss}
        style={styles.sheetBackdrop}
      />

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Finish this workout?</Text>
        <Text style={styles.sheetBody}>
          {`${elapsed}Your logged sets are saved on this device.`}
        </Text>

        <View style={styles.sheetActions}>
          <Button
            fullWidth
            label="Finish workout"
            onPress={() => onChoose('finish')}
            testID={testID ? `${testID}-finish` : undefined}
          />
          <Button
            fullWidth
            label="Discard workout"
            onPress={() => onChoose('discard')}
            testID={testID ? `${testID}-discard` : undefined}
            variant="secondary"
          />
        </View>

        <Pressable
          accessibilityLabel="Keep training"
          accessibilityRole="button"
          onPress={onDismiss}
          style={styles.sheetKeep}
          testID={testID ? `${testID}-keep` : undefined}
        >
          <Text style={styles.sheetKeepLabel}>Keep training</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingTop: CONTENT_TOP,
    paddingBottom: spacing.huge,
    paddingHorizontal: gutter,
  },
  block: {
    marginTop: BLOCK_GAP,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: gutter,
    paddingTop: spacing.sm,
  },
  restBar: {
    flex: 1,
  },
  restLabel: {
    ...type.labelSmall,
    fontVariant: ['tabular-nums'],
    color: colors.textMuted,
  },
  hiddenInput: {
    position: 'absolute',
    height: 1,
    width: 1,
    opacity: 0,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
    padding: gutter,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    padding: gutter,
  },
  sheetTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: colors.textPrimary,
  },
  sheetBody: {
    ...type.body,
    fontSize: 14,
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  sheetActions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  sheetKeep: {
    height: 44,
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetKeepLabel: {
    ...type.button,
    color: colors.textPrimary,
  },
});
