/**
 * One exercise block of the active session: title, "last time" line, the
 * set table, and the "add set" action.
 *
 * Blocks sit directly on the canvas and are separated by spacing alone —
 * there is no card, no border, and no alternating surface. The column
 * heading row is the only structure above the table, and the hairline
 * under it is the only rule in the block.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@components/Badge';
import { colors, spacing, type } from '@theme';

import { MoreGlyph } from './Glyphs';
import { NUMERIC_COLUMN_WIDTH, SetRow, type SetRowState } from './SetRow';
import type { ActiveExercise, FocusedCell } from '../types';

/** Height of the column-heading row. */
export const COLUMN_HEADER_HEIGHT = 16;

/** Rendered edge length of the overflow glyph. */
const MORE_GLYPH_SIZE = 20;

/** Square tap target for the overflow action. */
const MORE_TARGET = 44;

/** Props for {@link ExerciseBlock}. */
export interface ExerciseBlockProps {
  exercise: ActiveExercise;
  /** The set currently being logged, if any. */
  activeSetId: string | null;
  /** The focused numeric cell, if any. */
  focusedCell: FocusedCell | null;
  /** Cell display text — the draft while a cell is being edited. */
  displayValue: (cell: FocusedCell, actual: number) => string;
  /** `Last time · 80kg × 8, 8, 7`, or `null` with no history. */
  lastTimeLine: string | null;
  /** Called when a numeric cell is pressed. */
  onFocusCell: (cell: FocusedCell) => void;
  /** Called when a set's check is pressed. */
  onToggleComplete: (setId: string) => void;
  /** Called when "Add set" is pressed. */
  onAddSet: () => void;
  /** Called when the overflow action is pressed. */
  onPressMore: () => void;
  /**
   * When set, the exercise-name row becomes a tap target. Used by the
   * read-only session detail table to open the exercise's analytics.
   */
  onPressHeader?: () => void;
  /**
   * Render as a static record: no overflow action, no "Add set", neutral
   * (non-interactive) set rows. Used by the read-only session detail table.
   */
  readOnly?: boolean;
  /** One-line summary shown at the right of the title when `readOnly`. */
  summary?: string;
  /**
   * Registers the block's set rows for measurement, so the screen can scroll
   * the row being edited clear of the keyboard.
   */
  registerRowRef: (setId: string, node: View | null) => void;
  testID?: string;
}

/** Column headings, in table order. Values are centered under them. */
const COLUMNS: readonly string[] = ['Set', 'kg', 'Reps'];

/**
 * The full set table for one exercise. Renders the "PR" pill in the title
 * row as soon as any completed set in the block set a record — inline, no
 * modal and no sound, per the workout rules.
 */
export function ExerciseBlock({
  exercise,
  activeSetId,
  focusedCell,
  displayValue,
  lastTimeLine,
  onFocusCell,
  onToggleComplete,
  onAddSet,
  onPressMore,
  onPressHeader,
  readOnly = false,
  summary,
  registerRowRef,
  testID,
}: ExerciseBlockProps): React.ReactElement {
  const hasPR = exercise.sets.some((set) => set.isPR);

  const titleRow = (
    <>
      <Text numberOfLines={1} style={styles.title}>
        {exercise.name}
      </Text>

      {hasPR ? (
        <View style={styles.badge}>
          <Badge label="PR" testID={testID ? `${testID}-pr-badge` : undefined} variant="pr" />
        </View>
      ) : null}

      {readOnly ? (
        summary !== undefined ? (
          <Text numberOfLines={1} style={styles.summary} testID={testID ? `${testID}-summary` : undefined}>
            {summary}
          </Text>
        ) : null
      ) : (
        <Pressable
          accessibilityLabel="Exercise options"
          accessibilityRole="button"
          onPress={onPressMore}
          style={styles.more}
          testID={testID ? `${testID}-more` : undefined}
        >
          <MoreGlyph size={MORE_GLYPH_SIZE} />
        </Pressable>
      )}
    </>
  );

  return (
    <View testID={testID}>
      {onPressHeader === undefined ? (
        <View style={styles.titleRow}>{titleRow}</View>
      ) : (
        <Pressable
          accessibilityLabel={`Open ${exercise.name}`}
          accessibilityRole="button"
          onPress={onPressHeader}
          style={styles.titleRow}
          testID={testID ? `${testID}-header` : undefined}
        >
          {titleRow}
        </Pressable>
      )}

      {lastTimeLine !== null ? (
        <Text style={styles.lastTime}>{lastTimeLine}</Text>
      ) : null}

      <View style={styles.columnHeader}>
        <Text style={styles.columnLabelSet}>{COLUMNS[0]}</Text>
        <View style={styles.columnNumerics}>
          {COLUMNS.slice(1).map((label) => (
            <Text key={label} style={styles.columnLabel}>
              {label}
            </Text>
          ))}
        </View>
        {readOnly ? null : <View style={styles.columnSpacer} />}
      </View>

      <View style={styles.rule} />

      <View style={styles.table}>
        {exercise.sets.map((set, index) => {
          const state: SetRowState =
            set.completed ? 'completed' : set.id === activeSetId ? 'active' : 'pending';

          return (
            <View key={set.id}>
              {index > 0 ? <View style={styles.rowDivider} /> : null}
              <SetRow
                index={index + 1}
                isRepsFocused={focusedCell?.setId === set.id && focusedCell.field === 'reps'}
                isWeightFocused={focusedCell?.setId === set.id && focusedCell.field === 'weight'}
                onPressReps={() => onFocusCell({ setId: set.id, field: 'reps' })}
                onPressWeight={() => onFocusCell({ setId: set.id, field: 'weight' })}
                onToggleComplete={() => onToggleComplete(set.id)}
                readOnly={readOnly}
                repsText={displayValue({ setId: set.id, field: 'reps' }, set.reps)}
                rowRef={(node) => registerRowRef(set.id, node)}
                state={state}
                testID={testID ? `${testID}-set-${index}` : undefined}
                weightText={displayValue(
                  { setId: set.id, field: 'weight' },
                  set.weightKg,
                )}
              />
            </View>
          );
        })}
      </View>

      {readOnly ? null : (
        <Pressable
          accessibilityLabel={`Add set to ${exercise.name}`}
          accessibilityRole="button"
          onPress={onAddSet}
          style={styles.addSet}
          testID={testID ? `${testID}-add-set` : undefined}
        >
          <Text style={styles.addSetLabel}>＋ Add set</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    height: MORE_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: colors.textPrimary,
  },
  badge: {
    marginRight: spacing.xs,
  },
  /** Read-only right-aligned "<N> sets · <volume>" summary. */
  summary: {
    ...type.bodySmall,
    marginLeft: spacing.md,
    fontVariant: ['tabular-nums'],
    color: colors.textMuted,
  },
  more: {
    width: MORE_TARGET,
    height: MORE_TARGET,
    marginRight: -spacing.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  /** 4px below the title row, per the spec. */
  lastTime: {
    ...type.label,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  /** 16px below the "last time" line. Mirrors the set-row layout exactly. */
  columnHeader: {
    height: COLUMN_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  /** Centered over the 28px set-number circle. */
  columnLabelSet: {
    ...type.labelSmall,
    letterSpacing: 0.44,
    width: 28,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  /** Same geometry as the numeric cell row in `SetRow`. */
  columnNumerics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: spacing.lg,
  },
  columnLabel: {
    ...type.labelSmall,
    letterSpacing: 0.44,
    width: NUMERIC_COLUMN_WIDTH,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  columnSpacer: {
    width: 44,
  },
  /** 8px below the column headings. */
  rule: {
    height: 1,
    marginTop: spacing.sm,
    backgroundColor: colors.hairline,
  },
  table: {
    marginLeft: 0,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  /** 12px below the last set row. */
  addSet: {
    height: 44,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  addSetLabel: {
    ...type.body,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: colors.textPrimary,
  },
});
