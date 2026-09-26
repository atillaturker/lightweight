/**
 * Bottom sheet for overriding a routine's estimated duration.
 *
 * Mirrors {@link TargetSheet}'s visual pattern: a slide-up canvas panel
 * with a wrapping row of pills. Selecting a pill commits immediately and
 * closes the sheet; the "Use calculated" action clears the override. There
 * is no primary CTA — either tap closes the sheet.
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

import { colors, gutter, radii, spacing, type } from '@theme';

import { ValuePill } from './ValuePill';

/** Selectable duration overrides, in minutes. */
const DURATION_OPTIONS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120] as const;

/** Props for {@link DurationSheet}. */
export interface DurationSheetProps {
  visible: boolean;
  /** The stored override, or `undefined` when the estimate is in use. */
  currentMinutes: number | undefined;
  /** The calculated estimate shown by the "Use calculated" action. */
  calculatedMinutes: number;
  onSelect: (minutes: number) => void;
  onClear: () => void;
  onClose: () => void;
}

/**
 * Duration override picker. Every action closes the sheet after firing its
 * callback, so the screen only has to write to the store.
 */
export function DurationSheet({
  visible,
  currentMinutes,
  calculatedMinutes,
  onSelect,
  onClear,
  onClose,
}: DurationSheetProps): React.ReactElement {
  const handleSelect = (minutes: number): void => {
    onSelect(minutes);
    onClose();
  };

  const handleClear = (): void => {
    onClear();
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

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.hairline} />

        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Estimated time</Text>

          <Text style={styles.groupLabel}>MINUTES</Text>
          <View style={styles.pillRow}>
            {DURATION_OPTIONS.map((value) => (
              <ValuePill
                key={value}
                onPress={() => handleSelect(value)}
                selected={value === currentMinutes}
                value={value}
              />
            ))}
          </View>

          <Pressable
            accessibilityLabel={`Use calculated ${calculatedMinutes} minutes`}
            accessibilityRole="button"
            onPress={handleClear}
            style={styles.clearAction}
            testID="duration-sheet-clear"
          >
            <Text style={styles.clearLabel}>
              {`Use calculated (~${calculatedMinutes} min)`}
            </Text>
          </Pressable>
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

  clearAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: spacing.xxl,
  },
  clearLabel: {
    ...type.label,
    fontSize: 14,
    color: colors.textMuted,
  },
});
