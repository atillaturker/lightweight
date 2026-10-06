/**
 * Create a custom exercise, from the exercise picker.
 *
 * Name, muscle group, equipment, how sets are measured, and whether reps
 * are per side. One primary action; it is never disabled — an empty name
 * shows an inline error instead. The new exercise is stored locally,
 * mirrored to the cloud, and handed back to the picker pre-selected.
 */
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { Equipment, ExerciseMeasure, MuscleGroup } from "@domain/entities";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { SegmentedControl } from "@components/SegmentedControl";
import { Toggle } from "@components/Toggle";
import { createStyles, gutter, spacing, type } from "@theme";

import { FilterChips } from "../components/FilterChips";
import { useCreateCustomExercise } from "../hooks";
import { CUSTOM_EXERCISE_NAME_MAX } from "../services";
import { EQUIPMENT_OPTIONS } from "../utils";

import type { TodayStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<TodayStackParamList, "CustomExercise">;

const MUSCLE_CHIPS: readonly { key: MuscleGroup; label: string }[] = [
  { key: "chest", label: "Chest" },
  { key: "back", label: "Back" },
  { key: "shoulders", label: "Shoulders" },
  { key: "arms", label: "Arms" },
  { key: "legs", label: "Legs" },
  { key: "core", label: "Core" },
];

const EQUIPMENT_CHIPS = EQUIPMENT_OPTIONS.map((option) => ({ key: option.value, label: option.label }));

const MEASURE_OPTIONS = [
  { value: "reps", label: "Reps" },
  { value: "time", label: "Time" },
];

/** A labelled form section. */
function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

/** The create-exercise form. */
export function CustomExerciseScreen({ navigation, route }: Props): React.ReactElement {
  const styles = useStyles();
  const createExercise = useCreateCustomExercise();
  const [name, setName] = useState(route.params.initialName ?? "");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("chest");
  const [equipment, setEquipment] = useState<Equipment>("barbell");
  const [measure, setMeasure] = useState<ExerciseMeasure>("reps");
  const [perSide, setPerSide] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const handleCreate = (): void => {
    if (name.trim() === "") {
      setNameError("Give the exercise a name.");
      return;
    }
    const exercise = createExercise({ name, muscleGroup, equipment, measure, perSide });
    navigation.navigate({
      name: "ExercisePicker",
      params: { ...route.params.picker, createdExerciseId: exercise.id },
      merge: true,
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader onBack={navigation.goBack} showBack title="New exercise" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.padded}>
          <Input
            error={nameError}
            label="Name"
            maxLength={CUSTOM_EXERCISE_NAME_MAX}
            onChangeText={(text) => {
              setName(text);
              setNameError(undefined);
            }}
            placeholder="e.g. Landmine Press"
            testID="custom-exercise-name"
            value={name}
          />
        </View>
        <Field label="MUSCLE GROUP">
          <FilterChips
            accessibilityLabel="Muscle group"
            isSelected={(key) => key === muscleGroup}
            onPress={setMuscleGroup}
            options={MUSCLE_CHIPS}
            testID="custom-exercise-group"
          />
        </Field>
        <Field label="EQUIPMENT">
          <FilterChips
            accessibilityLabel="Equipment"
            isSelected={(key) => key === equipment}
            onPress={setEquipment}
            options={EQUIPMENT_CHIPS}
            testID="custom-exercise-equipment"
          />
        </Field>
        <Field label="MEASURED BY">
          <View style={styles.padded}>
            <SegmentedControl
              onChange={(value) => setMeasure(value === "time" ? "time" : "reps")}
              options={MEASURE_OPTIONS}
              testID="custom-exercise-measure"
              value={measure}
            />
          </View>
        </Field>
        <View style={[styles.padded, styles.toggleRow]}>
          <Text style={styles.toggleLabel}>One side at a time</Text>
          <Toggle onChange={setPerSide} testID="custom-exercise-per-side" value={perSide} />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button fullWidth label="Create exercise" onPress={handleCreate} testID="custom-exercise-create" />
      </View>
    </SafeAreaView>
  );
}

const useStyles = createStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  padded: { paddingHorizontal: gutter },
  field: { marginTop: spacing.xxl },
  fieldLabel: {
    ...type.labelSmall,
    paddingHorizontal: gutter,
    marginBottom: spacing.sm,
    letterSpacing: 0.66,
    color: colors.textMuted,
  },
  toggleRow: {
    marginTop: spacing.xxl,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: { ...type.body, color: colors.textPrimary },
  footer: {
    paddingHorizontal: gutter,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
}));
