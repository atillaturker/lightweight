/**
 * Screen headers for the training loop.
 *
 * `TodayHeader` carries the Today title plus the circular calendar action.
 * `TodayWorkoutHeader` is the focused-mode header of an active session: a
 * close target, the routine name, and a Finish text action. Neither draws
 * a hairline or a shadow — the session bar below supplies the separation.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, gutter, spacing, type } from '@theme';

import { CalendarGlyph, CloseGlyph } from './Glyphs';

/** Header height, matching the platform-navigation convention. */
export const TODAY_HEADER_HEIGHT = 44;

/** Diameter of the circular calendar button in the Today header. */
const CALENDAR_BUTTON_SIZE = 36;

/** Rendered edge length of the calendar glyph. */
const CALENDAR_GLYPH_SIZE = 20;

/** Rendered edge length of the close glyph. */
const CLOSE_GLYPH_SIZE = 20;

/** Square tap target for a header action. */
const TAP_TARGET = 44;

/** Props for {@link TodayHeader}. */
export interface TodayHeaderProps {
  /** Called when the calendar action is pressed. */
  onPressCalendar?: () => void;
  testID?: string;
}

/** Props for {@link TodayWorkoutHeader}. */
export interface TodayWorkoutHeaderProps {
  /** Routine name, centered. */
  title: string;
  /** Called when the close target is pressed. */
  onClose: () => void;
  /** Called when the Finish action is pressed. */
  onFinish: () => void;
  testID?: string;
}

/**
 * Today header: left-aligned title, right-aligned circular calendar
 * action with a hairline border and no fill.
 */
export function TodayHeader({
  onPressCalendar,
  testID,
}: TodayHeaderProps): React.ReactElement {
  return (
    <View style={styles.header} testID={testID}>
      <Text style={styles.title}>Today</Text>

      <Pressable
        accessibilityLabel="Open calendar"
        accessibilityRole="button"
        onPress={onPressCalendar}
        style={styles.calendarButton}
        testID={testID ? `${testID}-calendar` : undefined}
      >
        <CalendarGlyph size={CALENDAR_GLYPH_SIZE} />
      </Pressable>
    </View>
  );
}

/**
 * Focused-mode header for an active session. Three fixed slots keep the
 * routine name optically centered regardless of the action widths.
 */
export function TodayWorkoutHeader({
  title,
  onClose,
  onFinish,
  testID,
}: TodayWorkoutHeaderProps): React.ReactElement {
  return (
    <View style={styles.header} testID={testID}>
      <Pressable
        accessibilityLabel="Close workout"
        accessibilityRole="button"
        hitSlop={spacing.xs}
        onPress={onClose}
        style={styles.closeTarget}
        testID={testID ? `${testID}-close` : undefined}
      >
        <CloseGlyph size={CLOSE_GLYPH_SIZE} />
      </Pressable>

      <Text numberOfLines={1} style={[styles.title, styles.centeredTitle]}>
        {title}
      </Text>

      <Pressable
        accessibilityLabel="Finish workout"
        accessibilityRole="button"
        onPress={onFinish}
        style={styles.finishTarget}
        testID={testID ? `${testID}-finish` : undefined}
      >
        <Text style={styles.finishLabel}>Finish</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: TODAY_HEADER_HEIGHT,
    paddingHorizontal: gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.canvas,
  },
  title: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
  },
  calendarButton: {
    width: CALENDAR_BUTTON_SIZE,
    height: CALENDAR_BUTTON_SIZE,
    borderRadius: CALENDAR_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTarget: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    marginLeft: -spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishTarget: {
    minWidth: TAP_TARGET,
    height: TAP_TARGET,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  finishLabel: {
    ...type.button,
    color: colors.textPrimary,
  },
});
