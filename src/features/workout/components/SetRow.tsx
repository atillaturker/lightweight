/**
 * One row of the set table.
 *
 * The row is the only place in the app where a numeric value is edited
 * inline, so it owns three tap targets — kilo cell, reps cell, check —
 * and no more. Its `state` prop drives every visual difference between a
 * completed row, the active row, and a pending one, which keeps the
 * screen's conditional logic out of the styles.
 *
 * Tap targets are 44px even though the row is 52px tall by design: the
 * cells stretch to the full row height, so the numbers stay comfortably
 * pressable without inflating the table.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, type } from '@theme';

import { CheckGlyph } from './Glyphs';
import type { ActiveSet } from '../types';

/** Fixed row height, per the set-table spec. */
export const SET_ROW_HEIGHT = 52;

/** Diameter of the set-number circle. */
const SET_NUMBER_SIZE = 28;

/** Diameter of the completion check circle. */
const CHECK_SIZE = 24;

/** Rendered edge length of the check glyph inside a filled circle. */
const CHECK_GLYPH_SIZE = 12;

/** Width of the numeric columns, so headings and values line up. */
export const NUMERIC_COLUMN_WIDTH = 88;

/** Underline height under the focused numeric cell. */
const UNDERLINE_HEIGHT = 1;

/** How a row is presented: completed, active, or not yet reached. */
export type SetRowState = 'completed' | 'active' | 'pending';

/** Props for {@link SetRow}. */
export interface SetRowProps {
  /** 1-based position in the exercise. */
  index: number;
  /** Text shown in the kilo cell — the draft while it is being edited. */
  weightText: string;
  /** Text shown in the reps cell — the draft while it is being edited. */
  repsText: string;
  /** Presentation state for the row. */
  state: SetRowState;
  /** Whether the kilo cell carries the focus underline. */
  isWeightFocused: boolean;
  /** Whether the reps cell carries the focus underline. */
  isRepsFocused: boolean;
  /** Called when the kilo cell is pressed. */
  onPressWeight: () => void;
  /** Called when the reps cell is pressed. */
  onPressReps: () => void;
  /** Called when the check is pressed. */
  onToggleComplete: () => void;
  /**
   * Render as a static record: neutral outline set number, no tap targets,
   * and no completion check. Used by the read-only session detail table.
   */
  readOnly?: boolean;
  /**
   * Receives the row element so an ancestor can measure its position. The
   * screen uses this to scroll the row being edited clear of the keyboard.
   */
  rowRef?: (node: View | null) => void;
  testID?: string;
}

/** Derive the row state from a set and its position in the block. */
export function resolveRowState(
  set: ActiveSet,
  isActiveRow: boolean,
): SetRowState {
  if (set.completed) return 'completed';
  return isActiveRow ? 'active' : 'pending';
}

/** One editable numeric cell, with an optional focus underline. */
function NumericCell({
  value,
  unit,
  focused,
  onPress,
  readOnly = false,
  testID,
}: {
  value: string;
  unit?: string;
  focused: boolean;
  onPress: () => void;
  readOnly?: boolean;
  testID?: string;
}): React.ReactElement {
  const label = (
    <Text style={styles.value}>
      {value}
      {unit !== undefined ? <Text style={styles.unit}> {unit}</Text> : null}
    </Text>
  );

  if (readOnly) {
    return (
      <View style={styles.cell} testID={testID}>
        {label}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={unit === undefined ? value : `${value} ${unit}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.cell}
      testID={testID}
    >
      {label}
      {focused ? <View style={styles.underline} /> : null}
    </Pressable>
  );
}

/**
 * A single set. Completed rows fill both circles; the active row outlines
 * them and underlines whichever cell is focused; pending rows mute their
 * values so the eye lands on what is being logged now.
 */
export function SetRow({
  index,
  weightText,
  repsText,
  state,
  isWeightFocused,
  isRepsFocused,
  onPressWeight,
  onPressReps,
  onToggleComplete,
  readOnly = false,
  rowRef,
  testID,
}: SetRowProps): React.ReactElement {
  const isCompleted = !readOnly && state === 'completed';
  const isActive = !readOnly && state === 'active';

  return (
    <View ref={rowRef} style={styles.row} testID={testID}>
      <View
        style={[
          styles.setNumber,
          isCompleted ? styles.circleFilled : styles.circleHollow,
          isActive ? styles.circleActive : null,
        ]}
      >
        <Text style={[styles.setNumberLabel, isCompleted ? styles.labelInverse : null]}>
          {index}
        </Text>
      </View>

      <View style={styles.numerics}>
        <NumericCell
          focused={isWeightFocused}
          onPress={onPressWeight}
          readOnly={readOnly}
          testID={testID ? `${testID}-weight` : undefined}
          unit="kg"
          value={weightText}
        />
        <NumericCell
          focused={isRepsFocused}
          onPress={onPressReps}
          readOnly={readOnly}
          testID={testID ? `${testID}-reps` : undefined}
          value={repsText}
        />
      </View>

      {readOnly ? null : (
        <Pressable
          accessibilityLabel="Toggle set complete"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          onPress={onToggleComplete}
          style={styles.checkTarget}
          testID={testID ? `${testID}-check` : undefined}
        >
          <View
            style={[
              styles.check,
              isCompleted ? styles.circleFilled : styles.circleHollow,
              isActive ? styles.circleActive : null,
            ]}
          >
            {isCompleted ? <CheckGlyph size={CHECK_GLYPH_SIZE} /> : null}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: SET_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleHollow: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  /** The active row's outline is the only primary-colored border in the table. */
  circleActive: {
    borderColor: colors.primary,
  },
  circleFilled: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  setNumber: {
    width: SET_NUMBER_SIZE,
    height: SET_NUMBER_SIZE,
    borderRadius: SET_NUMBER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberLabel: {
    ...type.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  labelInverse: {
    color: colors.textInverse,
  },
  numerics: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.lg,
  },
  cell: {
    width: NUMERIC_COLUMN_WIDTH,
    height: SET_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  unit: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  underline: {
    position: 'absolute',
    bottom: spacing.sm,
    height: UNDERLINE_HEIGHT,
    width: NUMERIC_COLUMN_WIDTH - spacing.xl,
    backgroundColor: colors.primary,
  },
  checkTarget: {
    width: 44,
    height: SET_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** Corner radius shared by the circles, exported for tests and layout math. */
export const SET_CIRCLE_RADIUS = radii.pill;
