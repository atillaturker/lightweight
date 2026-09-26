/**
 * Generic single-select bottom sheet for a preference with a small set of
 * options (units, week start, rest timer).
 *
 * Follows the same sheet pattern as the routines' target/duration sheets:
 * a slide-up canvas panel with a wrapping row of pills. Selecting a pill
 * commits the value and closes the sheet; there is no primary CTA.
 */
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pill } from '@components/Pill';
import { colors, gutter, radii, spacing, type } from '@theme';

/** One selectable option. `value` is what gets committed. */
export interface OptionSheetOption<T extends string | number> {
  value: T;
  label: string;
}

/** Props for {@link OptionSheet}. */
export interface OptionSheetProps<T extends string | number> {
  visible: boolean;
  /** Sheet title, e.g. "Units". */
  title: string;
  /** Uppercase group label above the pills, e.g. "UNITS". */
  sectionLabel: string;
  options: readonly OptionSheetOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  testID?: string;
}

/**
 * Pill-row picker. Every pill press fires `onSelect` then `onClose`, so the
 * caller only has to write the value to its store.
 */
export function OptionSheet<T extends string | number>({
  visible,
  title,
  sectionLabel,
  options,
  selectedValue,
  onSelect,
  onClose,
  testID,
}: OptionSheetProps<T>): React.ReactElement {
  const handleSelect = (value: T): void => {
    onSelect(value);
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

      <SafeAreaView edges={['bottom']} style={styles.sheet} testID={testID}>
        <View style={styles.hairline} />

        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.groupLabel}>{sectionLabel}</Text>
          <View style={styles.pillRow}>
            {options.map((option) => (
              <Pill
                key={String(option.value)}
                label={option.label}
                onPress={() => handleSelect(option.value)}
                selected={option.value === selectedValue}
                testID={
                  testID ? `${testID}-option-${String(option.value)}` : undefined
                }
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  sheet: {
    marginTop: 'auto',
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

  groupLabel: {
    ...type.labelSmall,
    marginTop: spacing.xxl,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },

  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
