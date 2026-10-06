import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@components/Button";
import { gutter, radii, spacing, type, createStyles } from "@theme";

import { ValuePill } from "./ValuePill";

/** Selectable sets, 1..10. */
const SET_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Selectable reps, 1..20. */
const REP_OPTIONS = Array.from({ length: 20 }, (_, index) => index + 1);

/** Selectable hold lengths, in seconds, for timed exercises. */
const SECOND_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120] as const;

/** Props for {@link TargetSheet}. */
export interface TargetSheetProps {
  visible: boolean;
  exerciseName: string;
  initialSets: number;
  /** Reps, or seconds when `measure` is `time`. */
  initialReps: number;
  /** `time` edits seconds per set instead of reps. Defaults to `reps`. */
  measure?: "reps" | "time";
  /** Receives reps, or seconds for a timed exercise. */
  onConfirm: (sets: number, repsOrSeconds: number) => void;
  onRemove: () => void;
  onClose: () => void;
}

/**
 * Bottom sheet for editing one routine slot's suggested `sets × reps`
 * (or `sets × seconds` for a timed exercise).
 *
 * Both rows of pills are single-select. Values are held locally while the
 * sheet is open and committed only on "Save", so the routine list never
 * re-renders mid-selection. Dismissal is by backdrop tap; there is no
 * cancel button and no secondary action.
 */
export function TargetSheet({
  visible,
  exerciseName,
  initialSets,
  initialReps,
  measure = "reps",
  onConfirm,
  onRemove,
  onClose,
}: TargetSheetProps): React.ReactElement {
  const styles = useStyles();
  const isTimed = measure === "time";
  const valueOptions: readonly number[] = isTimed ? SECOND_OPTIONS : REP_OPTIONS;
  const [sets, setSets] = useState(initialSets);
  const [reps, setReps] = useState(initialReps);

  // Re-seed each time the sheet is opened for a (possibly different) slot.
  useEffect(() => {
    if (visible) {
      setSets(initialSets);
      setReps(initialReps);
    }
  }, [visible, initialSets, initialReps]);

  const handleRemove = (): void => {
    onRemove();
    onClose();
  };

  const handleSave = (): void => {
    onConfirm(sets, reps);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityLabel="Close"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}
      />

      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <View style={styles.hairline} />

        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text numberOfLines={1} style={styles.exerciseName}>
            {exerciseName}
          </Text>

          <Text style={styles.groupLabel}>SETS</Text>
          <View style={styles.pillRow}>
            {SET_OPTIONS.map((value) => (
              <ValuePill
                key={value}
                onPress={() => setSets(value)}
                selected={value === sets}
                value={value}
              />
            ))}
          </View>

          <Text style={styles.groupLabel}>{isTimed ? "SECONDS" : "REPS"}</Text>
          <View style={styles.pillRow}>
            {valueOptions.map((value) => (
              <ValuePill
                key={value}
                onPress={() => setReps(value)}
                selected={value === reps}
                value={value}
              />
            ))}
          </View>

          <Pressable
            accessibilityLabel="Remove exercise"
            accessibilityRole="button"
            onPress={handleRemove}
            style={styles.removeAction}
          >
            <Text style={styles.removeLabel}>Remove exercise</Text>
          </Pressable>

          <Button
            fullWidth
            label="Save"
            onPress={handleSave}
            testID="target-sheet-save"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = createStyles((colors) => ({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },

  sheet: {
    marginTop: "auto",
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radii.stage,
    borderTopRightRadius: radii.stage,
  },

  hairline: {
    height: 1,
    backgroundColor: colors.hairline,
  },

  sheetContent: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },

  exerciseName: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },

  groupLabel: {
    ...type.labelSmall,
    marginTop: spacing.xxl,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  removeAction: {
    justifyContent: "center",
    height: 44,
    marginTop: spacing.xxl,
  },
  removeLabel: {
    ...type.button,
    color: colors.error,
  },
}));
