/**
 * Bottom action sheet for one routine, opened from the "⋯" on a routine row.
 *
 * The active routine's sheet omits "Set as active" — it already is. "Delete"
 * is destructive: it uses the error color and shows a confirmation alert
 * before the routine is removed. Every action closes the sheet.
 *
 * Follows the shared sheet pattern (slide-up canvas panel, top hairline,
 * backdrop) used by the target and duration sheets.
 */
import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Routine } from "@domain/entities";
import { colors, gutter, radii, spacing, type } from "@theme";

/** Props for {@link RoutineActionSheet}. */
export interface RoutineActionSheetProps {
  visible: boolean;
  /** Routine the actions apply to, or `null` while closed. */
  routine: Routine | null;
  /** Whether {@link routine} is the active routine. */
  isActive: boolean;
  /** Called to make the routine active. */
  onSetActive: (routineId: string) => void;
  /** Called to open the routine in the editor. */
  onEdit: (routineId: string) => void;
  /** Called after the user confirms deletion. */
  onDelete: (routineId: string) => void;
  /** Called when the sheet is dismissed without an action. */
  onClose: () => void;
}

/** One tappable action row in the sheet. */
function ActionRow({
  label,
  destructive = false,
  onPress,
  testID,
}: {
  label: string;
  destructive?: boolean;
  onPress: () => void;
  testID: string;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.actionRow}
      testID={testID}
    >
      <Text
        style={[styles.actionLabel, destructive && styles.actionLabelDestructive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Routine action sheet. Owns the destructive confirmation so every entry
 * point behaves identically.
 */
export function RoutineActionSheet({
  visible,
  routine,
  isActive,
  onSetActive,
  onEdit,
  onDelete,
  onClose,
}: RoutineActionSheetProps): React.ReactElement {
  const handleSetActive = (): void => {
    if (routine) onSetActive(routine.id);
    onClose();
  };

  const handleEdit = (): void => {
    if (routine) onEdit(routine.id);
    onClose();
  };

  const handleDelete = (): void => {
    if (!routine) return;
    const routineId = routine.id;

    // Close first so the alert is not stacked on a live modal.
    onClose();
    Alert.alert("Delete this routine?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(routineId),
      },
    ]);
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

      <SafeAreaView
        edges={["bottom"]}
        style={styles.sheet}
        testID="routine-action-sheet"
      >
        <View style={styles.hairline} />

        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text numberOfLines={1} style={styles.title}>
            {routine?.name ?? ""}
          </Text>

          {isActive ? (
            <Text style={styles.subtitle}>Currently your active routine.</Text>
          ) : null}

          <View style={styles.actions}>
            {isActive ? null : (
              <ActionRow
                label="Set as active"
                onPress={handleSetActive}
                testID="routine-action-set-active"
              />
            )}
            <ActionRow
              label="Edit routine"
              onPress={handleEdit}
              testID="routine-action-edit"
            />
            <ActionRow
              destructive
              label="Delete"
              onPress={handleDelete}
              testID="routine-action-delete"
            />
          </View>

          <View style={styles.cancelDivider} />
          <ActionRow
            label="Cancel"
            onPress={onClose}
            testID="routine-action-cancel"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
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

  title: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.bodySmall,
    marginTop: 2,
    color: colors.textMuted,
  },

  actions: {
    marginTop: spacing.lg,
  },
  actionRow: {
    justifyContent: "center",
    minHeight: 52,
  },
  actionLabel: {
    ...type.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  actionLabelDestructive: {
    color: colors.error,
  },

  cancelDivider: {
    height: 1,
    marginTop: spacing.sm,
    backgroundColor: colors.hairline,
  },
});
