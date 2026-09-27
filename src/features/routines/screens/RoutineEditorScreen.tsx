/**
 * Routine editor — create or edit one routine's name and ordered exercise
 * slots.
 *
 * Draft-based: the routine is materialised in the store immediately (so
 * the screen always has a stable id), and every edit is applied straight
 * to that routine. There is no separate local copy to reconcile, which
 * keeps the persisted state the single source of truth even if the user
 * backgrounds the app mid-edit.
 *
 * The exercise picker is a peer route, so it re-enters this screen rather
 * than returning a value; selections are written to the store on arrival.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { ScreenHeader } from "@components/ScreenHeader";
import { colors, emptyStatePadding, fineSpacing, gutter, spacing, type } from "@theme";

import { DEFAULT_ROUTINE_NAME, estimateDurationMinutes } from "../config";
import { EXERCISE_LIBRARY } from "../services";
import { useRoutineStore } from "../store";
import { DurationSheet } from "../components/DurationSheet";
import { RoutineEditorRow } from "../components/RoutineEditorRow";
import { TargetSheet } from "../components/TargetSheet";
import { calculatedRoutineMinutes, routineDurationMinutes } from "../utils";

import type { TodayStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<TodayStackParamList, "RoutineEditor">;

/** The exercise currently having its targets edited, if any. */
interface TargetEditing {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
}

/** 44px back chevron, matching the shared header geometry. */
function PencilGlyph(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={16}
      stroke={colors.textMuted}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={16}
    >
      <Path d="M12 20h9 M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
  );
}

/** Plus glyph for the "Add exercise" action. */
function PlusGlyph(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={14}
      stroke={colors.textPrimary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={14}
    >
      <Path d="M12 5v14 M5 12h14" />
    </Svg>
  );
}

/**
 * Pushed editor for a new or existing routine. Create mode seeds a fresh
 * routine on mount; edit mode reads the routine identified by
 * `route.params.routineId`.
 */
export function RoutineEditorScreen({ navigation, route }: Props): React.ReactElement {
  const routines = useRoutineStore((state) => state.routines);
  const createRoutine = useRoutineStore((state) => state.createRoutine);
  const renameRoutine = useRoutineStore((state) => state.renameRoutine);
  const setActiveRoutine = useRoutineStore((state) => state.setActiveRoutine);
  const removeExercise = useRoutineStore((state) => state.removeExercise);

  const updateExerciseTarget = useRoutineStore(
    (state) => state.updateExerciseTarget,
  );
  const setRoutineDuration = useRoutineStore(
    (state) => state.setRoutineDuration,
  );

  /**
   * Whether this screen is creating a routine. Frozen at mount: seeding the
   * routine writes the id back into the route params, which must not flip
   * the screen into edit mode mid-session.
   */
  const [isCreateMode] = useState(() => route.params?.routineId === undefined);

  /**
   * Id of the routine being edited. `undefined` for the first frame of
   * create mode, until the mount effect has seeded it.
   */
  const [routineId, setRoutineId] = useState<string | undefined>(
    () => route.params?.routineId,
  );

  /**
   * Guards the one-shot creation below against a double-invoked effect.
   * Creating a routine writes to the store, which notifies every routine
   * subscriber — so it must never happen during render.
   */
  const hasSeededRef = useRef(false);

  useEffect(() => {
    if (!isCreateMode || hasSeededRef.current) return;
    hasSeededRef.current = true;

    const id = createRoutine();
    setRoutineId(id);
    // Keeps the route params truthful so a later re-entry resolves the
    // same routine instead of seeding a second one.
    navigation.setParams({ routineId: id });
  }, [createRoutine, isCreateMode, navigation]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [targetEditing, setTargetEditing] = useState<TargetEditing | null>(null);
  const [durationSheetVisible, setDurationSheetVisible] = useState(false);

  const routine = useMemo(
    () => routines.find((entry) => entry.id === routineId),
    [routines, routineId],
  );

  // Rows resolve against the library; ids with no library entry are shown
  // by their raw id so a stale reference is visible rather than dropped.
  const rows = useMemo(() => {
    const byId = new Map(EXERCISE_LIBRARY.map((entry) => [entry.id, entry]));
    return (routine?.exercises ?? []).map((slot) => {
      const exercise = byId.get(slot.exerciseId);
      return {
        slot,
        name: exercise?.name ?? slot.exerciseId,
        muscleGroup: exercise?.muscleGroup,
      };
    });
  }, [routine]);

  const beginRename = useCallback(() => {
    setNameDraft(routine?.name ?? "");
    setIsNameFocused(false);
    setIsRenaming(true);
  }, [routine]);

  const commitRename = useCallback(() => {
    setIsRenaming(false);
    const trimmed = nameDraft.trim();
    // An empty name reverts; the store would reject it anyway.
    if (trimmed && trimmed !== routine?.name && routineId) {
      renameRoutine(routineId, trimmed);
    }
  }, [nameDraft, renameRoutine, routine, routineId]);

  const handleOpenPicker = useCallback(() => {
    if (!routineId) return;

    navigation.navigate("ExercisePicker", {
      mode: "picker",
      routineId,
      preselectedIds: (routine?.exercises ?? []).map((slot) => slot.exerciseId),
    });
  }, [navigation, routine, routineId]);

  const handleSubmit = useCallback(() => {
    if (routine === undefined || !routineId) return;
    if (isCreateMode) {
      setActiveRoutine(routineId);
    }
    navigation.goBack();
  }, [isCreateMode, navigation, routine, routineId, setActiveRoutine]);

  const handleSelectDuration = useCallback(
    (minutes: number): void => {
      if (routineId) setRoutineDuration(routineId, minutes);
    },
    [routineId, setRoutineDuration],
  );

  const handleClearDuration = useCallback((): void => {
    if (routineId) setRoutineDuration(routineId, null);
  }, [routineId, setRoutineDuration]);

  const exerciseCount = routine?.exercises.length ?? 0;
  const routineName = routine?.name ?? DEFAULT_ROUTINE_NAME;
  const calculatedMinutes = routine
    ? calculatedRoutineMinutes(routine)
    : estimateDurationMinutes(exerciseCount);
  const durationMinutes = routine
    ? routineDurationMinutes(routine)
    : calculatedMinutes;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title={isCreateMode ? "New routine" : "Edit routine"}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Rename routine"
          accessibilityRole="button"
          disabled={isRenaming}
          onPress={beginRename}
          style={styles.nameRow}
        >
          {isRenaming ? (
            <TextInput
              autoFocus
              onBlur={commitRename}
              onChangeText={setNameDraft}
              onFocus={() => setIsNameFocused(true)}
              onSubmitEditing={commitRename}
              returnKeyType="done"
              style={[
                styles.nameInput,
                isNameFocused ? styles.nameInputFocused : null,
              ]}
              // Android's AppTheme paints `editTextBackground` (a native
              // underline) behind every input; suppress it so the custom
              // 1px rule below is the only line.
              underlineColorAndroid="transparent"
              value={nameDraft}
            />
          ) : (
            <>
              <Text numberOfLines={1} style={styles.name}>
                {routineName}
              </Text>
              <PencilGlyph />
            </>
          )}
        </Pressable>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{`${exerciseCount} exercises · `}</Text>
          <Pressable
            accessibilityLabel={`Estimated time ${durationMinutes} minutes`}
            accessibilityRole="button"
            onPress={() => setDurationSheetVisible(true)}
            style={styles.durationTarget}
            testID="routine-duration-target"
          >
            <Text style={[styles.meta, styles.durationValue]}>
              {`~${durationMinutes} min`}
            </Text>
          </Pressable>
        </View>

        {rows.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No exercises yet</Text>
            <Text style={styles.emptyMessage}>
              Add the first exercise to this routine.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {rows.map((row, index) => (
              <RoutineEditorRow
                key={row.slot.exerciseId}
                muscleGroup={row.muscleGroup}
                name={row.name}
                onEditTarget={() =>
                  setTargetEditing({
                    exerciseId: row.slot.exerciseId,
                    name: row.name,
                    sets: row.slot.targetSets,
                    reps: row.slot.targetReps,
                  })
                }
                showDivider={index > 0}
                targetReps={row.slot.targetReps}
                targetSets={row.slot.targetSets}
              />
            ))}
          </View>
        )}

        <Pressable
          accessibilityLabel="Add exercise"
          accessibilityRole="button"
          onPress={handleOpenPicker}
          style={styles.addAction}
        >
          <PlusGlyph />
          <Text style={styles.addLabel}>Add exercise</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          fullWidth
          label={isCreateMode ? "Create routine" : "Save changes"}
          onPress={handleSubmit}
          testID="routine-editor-submit"
        />
      </View>

      <DurationSheet
        calculatedMinutes={calculatedMinutes}
        currentMinutes={routine?.estimatedMinutes}
        onClear={handleClearDuration}
        onClose={() => setDurationSheetVisible(false)}
        onSelect={handleSelectDuration}
        visible={durationSheetVisible}
      />

      <TargetSheet
        exerciseName={targetEditing?.name ?? ""}
        initialReps={targetEditing?.reps ?? 0}
        initialSets={targetEditing?.sets ?? 0}
        onClose={() => setTargetEditing(null)}
        onConfirm={(sets, reps) => {
          if (targetEditing && routineId) {
            updateExerciseTarget(routineId, targetEditing.exerciseId, sets, reps);
          }
        }}
        onRemove={() => {
          if (targetEditing && routineId) {
            removeExercise(routineId, targetEditing.exerciseId);
          }
        }}
        visible={targetEditing !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  content: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 44,
  },
  name: {
    ...type.headline,
    flexShrink: 1,
    color: colors.textPrimary,
  },
  nameInput: {
    ...type.headline,
    flex: 1,
    padding: 0,
    color: colors.textPrimary,
  },
  /** The custom underline appears only while the input holds focus. */
  nameInputFocused: {
    borderBottomWidth: 1,
    borderBottomColor: colors.textPrimary,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: fineSpacing.tight,
  },
  meta: {
    ...type.bodySmall,
    color: colors.textMuted,
  },
  /**
   * A 44px tap target around the text line. The negative margin keeps the
   * meta line 18px tall so the 6px name gap and the list spacing below do
   * not shift.
   */
  durationTarget: {
    height: 44,
    justifyContent: "center",
    marginVertical: (18 - 44) / 2,
  },
  durationValue: {
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
    textDecorationColor: colors.textDivider,
  },

  list: { marginTop: spacing.xxxl },
  emptyState: {
    alignItems: "center",
    paddingVertical: emptyStatePadding,
  },
  emptyTitle: {
    ...type.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  emptyMessage: {
    ...type.body,
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textMuted,
  },

  addAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: fineSpacing.tight,
    height: 44,
    marginTop: spacing.lg,
  },
  addLabel: {
    ...type.label,
    fontSize: 15,
    color: colors.textPrimary,
  },

  footer: {
    paddingHorizontal: gutter,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
});
