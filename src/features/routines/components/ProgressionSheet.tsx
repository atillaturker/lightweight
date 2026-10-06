/**
 * Bottom sheet for choosing how a routine progresses its exercises.
 * Single-select; choosing an option applies it and closes the sheet.
 */
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ProgressionPolicy } from "@domain/rules";
import { Radio } from "@components/Radio";
import { createStyles, gutter, radii, spacing, type } from "@theme";

/** Short label per policy, for the editor's meta line. */
export const PROGRESSION_LABELS: Record<ProgressionPolicy, string> = {
  off: "No progression",
  linear: "Linear",
  double: "Double progression",
};

const OPTIONS: readonly { value: ProgressionPolicy; title: string; description: string }[] = [
  {
    value: "off",
    title: "No progression",
    description: "Each set starts where it ended last time.",
  },
  {
    value: "linear",
    title: "Linear",
    description:
      "Hit every rep on every set and the weight goes up next time. Miss three sessions in a row and it drops 10%.",
  },
  {
    value: "double",
    title: "Double progression",
    description:
      "Add reps up to the top of the range (target + 4), then add weight and start again from the target.",
  },
];

/** Props for {@link ProgressionSheet}. */
export interface ProgressionSheetProps {
  visible: boolean;
  current: ProgressionPolicy;
  onSelect: (policy: ProgressionPolicy) => void;
  onClose: () => void;
}

/** Progression policy picker. */
export function ProgressionSheet({ visible, current, onSelect, onClose }: ProgressionSheetProps): React.ReactElement {
  const styles = useStyles();
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Progression</Text>
          {OPTIONS.map((option, index) => (
            <Pressable
              accessibilityLabel={option.title}
              accessibilityRole="radio"
              accessibilityState={{ selected: option.value === current }}
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              style={[styles.option, index > 0 && styles.divider]}
              testID={`progression-option-${option.value}`}
            >
              <Radio selected={option.value === current} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = createStyles((colors) => ({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.backdrop },
  sheet: {
    marginTop: "auto",
    backgroundColor: colors.canvasRaised,
    borderTopLeftRadius: radii.stage,
    borderTopRightRadius: radii.stage,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  content: { paddingHorizontal: gutter, paddingTop: spacing.xxl, paddingBottom: spacing.xl },
  title: { ...type.sectionTitle, color: colors.textPrimary, marginBottom: spacing.md },
  option: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, paddingVertical: spacing.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  optionText: { flex: 1, gap: spacing.xs },
  optionTitle: { ...type.body, color: colors.textPrimary },
  optionDescription: { ...type.bodySmall, color: colors.textMuted },
}));
