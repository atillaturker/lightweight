/**
 * Bottom sheet that moves one planned session to another day, opened from
 * a day of the Home week plan. Lists today and the six days after it; a
 * day that already has a session swaps with the moved one, so nothing is
 * lost. The move applies to those dates only — the weekly plan itself is
 * unchanged.
 *
 * Follows the shared sheet pattern (slide-up canvas panel, top hairline,
 * backdrop) used by the routine action sheet.
 */
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, startOfDay } from '@domain/rules';
import { useRoutineStore } from '@features/routines';
import { fineSpacing, gutter, radii, spacing, type, createStyles } from '@theme';
import { formatShortDate, formatWeekdayLong } from '@lib/format';

import { moveTargets, type MoveTarget, type WeekPlanDay } from '../utils/weekPlan';

/** Props for {@link MoveSessionSheet}. */
export interface MoveSessionSheetProps {
  /** Day whose session moves, or `null` while closed. */
  day: WeekPlanDay | null;
  /** Render-pass timestamp, shared with the rest of the screen. */
  now: number;
  onClose: () => void;
}

/** `Today`, `Tomorrow`, or the weekday name. */
function dayName(date: number, now: number): string {
  const today = startOfDay(now);
  if (date === today) return 'Today';
  return date === addDays(today, 1) ? 'Tomorrow' : formatWeekdayLong(date);
}

/** One destination row. */
function TargetRow({
  target,
  now,
  onPress,
}: {
  target: MoveTarget;
  now: number;
  onPress: () => void;
}): React.ReactElement {
  const styles = useStyles();
  const name = dayName(target.date, now);
  const detail = target.routineName === null ? 'Rest' : `Swap with ${target.routineName}`;
  return (
    <Pressable
      accessibilityLabel={`Move to ${name}, ${detail}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.row}
      testID={`move-session-target-${new Date(target.date).getDay()}`}
    >
      <Text style={styles.rowLabel}>{name}</Text>
      <Text numberOfLines={1} style={styles.rowDetail}>
        {`${formatShortDate(target.date)} · ${detail}`}
      </Text>
    </Pressable>
  );
}

/** The move sheet. Owns the store write so every entry point behaves alike. */
export function MoveSessionSheet({ day, now, onClose }: MoveSessionSheetProps): React.ReactElement {
  const styles = useStyles();
  const routines = useRoutineStore((state) => state.routines);
  const overrides = useRoutineStore((state) => state.scheduleOverrides);
  const moveScheduledSession = useRoutineStore((state) => state.moveScheduledSession);
  const targets = day === null ? [] : moveTargets(now, day.date, routines, overrides);

  const handleMove = (to: number): void => {
    if (day !== null) moveScheduledSession(day.date, to, now);
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={day !== null}>
      <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
      <SafeAreaView edges={['bottom']} style={styles.sheet} testID="move-session-sheet">
        <View style={styles.hairline} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text numberOfLines={1} style={styles.title}>
            {`Move ${day?.routineName ?? 'session'}`}
          </Text>
          <Text style={styles.subtitle}>
            {day === null ? '' : `From ${formatWeekdayLong(day.date)}. Your weekly plan stays the same.`}
          </Text>
          <View style={styles.list}>
            {targets.map((target, index) => (
              <View key={target.date}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <TargetRow now={now} onPress={() => handleMove(target.date)} target={target} />
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.row} testID="move-session-cancel">
            <Text style={styles.rowLabel}>Cancel</Text>
          </Pressable>
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
    marginTop: 'auto',
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radii.stage,
    borderTopRightRadius: radii.stage,
  },
  hairline: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  content: {
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
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },
  list: {
    marginTop: spacing.lg,
  },
  row: {
    justifyContent: 'center',
    minHeight: 52,
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    ...type.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowDetail: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
}));
