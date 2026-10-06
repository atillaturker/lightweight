/**
 * Exercise picker — search, filter, and multi-select exercises.
 *
 * A peer route of the routine editor, not a modal returning a value: the
 * selections are committed straight to the routine in the store, so the
 * editor re-reads them on the way back. The route therefore carries
 * `routineId`; without it there is nothing to commit to and the screen
 * refuses to save rather than silently dropping the selection.
 *
 * `library` mode renders the same list. It is a read-only browse today —
 * the detail route it should push does not exist yet.
 *
 * The library holds over a thousand exercises, so the list is a
 * virtualized FlatList and each row is memoized.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { ScreenHeader } from "@components/ScreenHeader";
import type { Exercise, MuscleGroup as DomainMuscleGroup } from "@domain/entities";
import { colors, emptyStatePadding, fineSpacing, gutter, radii, spacing, type } from "@theme";

import { ExerciseThumb } from "../components/ExerciseThumb";
import { EXERCISE_LIBRARY } from "../services";
import { useRoutineStore } from "../store";

import type { TodayStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<TodayStackParamList, "ExercisePicker">;

/** Filter chips, in display order. `null` is the "All" chip. */
const FILTERS: readonly { label: string; group: DomainMuscleGroup | null }[] = [
  { label: "All", group: null },
  { label: "Chest", group: "chest" },
  { label: "Back", group: "back" },
  { label: "Shoulders", group: "shoulders" },
  { label: "Arms", group: "arms" },
  { label: "Legs", group: "legs" },
  { label: "Core", group: "core" },
];

/** Magnifier glyph for the search field. */
function SearchGlyph(): React.ReactElement {
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
      <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35" />
    </Svg>
  );
}

/** Plus glyph shown on unselected rows. */
function PlusGlyph(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={20}
      stroke={colors.textMuted}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={20}
    >
      <Path d="M12 5v14 M5 12h14" />
    </Svg>
  );
}

/** Check glyph shown on selected rows. */
function CheckGlyph(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={20}
      stroke={colors.textPrimary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={20}
    >
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

/** Capitalize a muscle group or equipment for display, e.g. `chest` → `Chest`. */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface PickerRowProps {
  exercise: Exercise;
  selected: boolean;
  showDivider: boolean;
  onToggle: (exerciseId: string) => void;
}

/** One selectable exercise row. Memoized: the list is long. */
const PickerRow = React.memo(function PickerRow({
  exercise,
  selected,
  showDivider,
  onToggle,
}: PickerRowProps): React.ReactElement {
  return (
    <View>
      {showDivider ? <View style={styles.rowHairline} /> : null}
      <Pressable
        accessibilityLabel={exercise.name}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onToggle(exercise.id)}
        style={styles.row}
      >
        <ExerciseThumb exerciseId={exercise.id} />
        <View style={styles.textColumn}>
          <Text numberOfLines={1} style={styles.exerciseName}>
            {exercise.name}
          </Text>
          <Text style={styles.muscleLabel}>
            {`${capitalize(exercise.muscleGroup)} · ${capitalize(exercise.equipment)}`}
          </Text>
        </View>
        <View style={styles.toggleColumn}>
          {selected ? <CheckGlyph /> : <PlusGlyph />}
        </View>
      </Pressable>
    </View>
  );
});

/** Shown when search and filter leave no rows. */
function NoResults(): React.ReactElement {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No exercises found</Text>
      <Text style={styles.emptyMessage}>Try a different search or category.</Text>
    </View>
  );
}

/**
 * Pushed exercise picker. Multi-select list committed to a routine on
 * confirm.
 */
export function ExercisePickerScreen({ navigation, route }: Props): React.ReactElement {
  const { mode, routineId } = route.params;

  const addExercisesToRoutine = useRoutineStore(
    (state) => state.addExercisesToRoutine,
  );

  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<DomainMuscleGroup | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => route.params.preselectedIds ?? [],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return EXERCISE_LIBRARY.filter((exercise) => {
      if (groupFilter !== null && exercise.muscleGroup !== groupFilter) {
        return false;
      }
      if (needle === "") return true;
      return (
        exercise.name.toLowerCase().includes(needle) ||
        exercise.equipment.toLowerCase().includes(needle) ||
        (exercise.targetMuscle?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [groupFilter, query]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggle = useCallback((exerciseId: string): void => {
    setSelectedIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
  }, []);

  const handleBack = useCallback((): void => {
    if (selectedIds.length === 0) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "Discard selections?",
      "Your selected exercises will not be added.",
      [
        { text: "Cancel", style: "default" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [navigation, selectedIds.length]);

  const handleConfirm = useCallback((): void => {
    // Defensive: the editor always passes routineId, so this only fires if
    // the route was reached from somewhere that did not.
    if (routineId === undefined) return;

    addExercisesToRoutine(routineId, selectedIds);
    navigation.goBack();
  }, [addExercisesToRoutine, navigation, routineId, selectedIds]);

  const renderRow = useCallback(
    ({ item, index }: ListRenderItemInfo<Exercise>) => (
      <PickerRow
        exercise={item}
        onToggle={toggle}
        selected={selectedSet.has(item.id)}
        showDivider={index > 0}
      />
    ),
    [selectedSet, toggle],
  );

  const confirmLabel =
    selectedIds.length === 1
      ? "Add 1 exercise"
      : `Add ${selectedIds.length} exercises`;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={handleBack}
        title={mode === "picker" ? "Add exercise" : "Exercise library"}
      />

      <View style={styles.searchWrap}>
        <View style={styles.searchGlyph}>
          <SearchGlyph />
        </View>
        <TextInput
          accessibilityLabel="Search exercises"
          onChangeText={setQuery}
          placeholder="Search exercises"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={query}
        />
      </View>

      <View style={styles.chips}>
        <ScrollView
          contentContainerStyle={styles.chipsContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {FILTERS.map((filter) => {
            const selected = filter.group === groupFilter;
            return (
              <Pressable
                accessibilityLabel={filter.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={filter.label}
                onPress={() => setGroupFilter(filter.group)}
                style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle]}
              >
                <Text
                  style={[styles.chipLabel, selected && styles.chipLabelSelected]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={rows}
        initialNumToRender={15}
        keyExtractor={(exercise) => exercise.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={NoResults}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        style={styles.listScroll}
        windowSize={7}
      />

      {selectedIds.length > 0 ? (
        <View style={styles.footer}>
          <Button
            fullWidth
            label={confirmLabel}
            onPress={handleConfirm}
            testID="exercise-picker-submit"
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  searchWrap: {
    position: "relative",
    justifyContent: "center",
    height: 48,
    marginTop: spacing.lg,
    marginHorizontal: gutter,
  },
  searchGlyph: {
    position: "absolute",
    left: spacing.md,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    paddingLeft: spacing.huge,
    paddingRight: spacing.md,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.control,
    ...type.body,
    color: colors.textPrimary,
  },

  chips: { marginTop: spacing.lg },
  chipsContent: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: gutter,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    paddingHorizontal: fineSpacing.loose,
    borderRadius: radii.pill,
  },
  chipIdle: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipSelected: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipLabel: {
    ...type.label,
    color: colors.textBody,
  },
  chipLabelSelected: {
    ...type.label,
    color: colors.accent,
  },

  listScroll: { flex: 1, marginTop: spacing.xxl },
  rowHairline: {
    height: 1,
    marginHorizontal: gutter,
    backgroundColor: colors.hairline,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingHorizontal: gutter,
  },

  textColumn: {
    flex: 1,
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  exerciseName: {
    ...type.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  muscleLabel: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },

  toggleColumn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

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

  footer: {
    paddingHorizontal: gutter,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
});
