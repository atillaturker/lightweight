/**
 * One exercise block of the active session: title, "last time" line, the
 * set table, and the "add set" action.
 *
 * Each block is one Card (DESIGN.md §7.2) — the same
 * component in the live table and the read-only Session Detail table. The
 * column heading row is the only structure above the set table, and the
 * set rows keep their internal hairlines.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@components/Badge';
import { Card } from '@components/Card';
import { spacing, type, createStyles } from '@theme';

import { MoreGlyph } from './Glyphs';
import { secondField } from '../hooks/useSetTableDraft';
import { numericColumnWidth, SetRow, type SetRowState } from './SetRow';
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
  displayValue: (cell: FocusedCell, actual: number | undefined) => string;
  /** Show the RPE column (the user's "RPE field" preference). */
  showRpe?: boolean;
  /** `Last time · 80kg × 8, 8, 7`, or `null` with no history. */
  lastTimeLine: string | null;
  /** Why the sets are prescribed as they are (routine progression). */
  prescriptionLine?: string | null;
  /** The user's note on this exercise, shown under the title. */
  note?: string | null;
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
  /** "A1", "A2"… when the exercise is part of a superset. */
  supersetLabel?: string;
  /**
   * Registers the block's set rows for measurement, so the screen can scroll
   * the row being edited clear of the keyboard.
   */
  registerRowRef: (setId: string, node: View | null) => void;
  testID?: string;
}

/**
 * Numeric column headings, in table order; values are centered under
 * them. Bodyweight and timed blocks log added load ("+kg"); timed blocks
 * log time where others log reps.
 */
export function numericColumns(
  exercise: Pick<ActiveExercise, 'measure' | 'perSide' | 'bodyweight'>,
  showRpe: boolean,
): string[] {
  const timed = exercise.measure === 'time';
  const weight = timed || exercise.bodyweight === true ? '+kg' : 'kg';
  const second = timed ? 'Time' : exercise.perSide === true ? 'Reps/side' : 'Reps';
  return showRpe ? [weight, second, 'RPE'] : [weight, second];
}

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
  showRpe = false,
  lastTimeLine,
  prescriptionLine = null,
  note = null,
  onFocusCell,
  onToggleComplete,
  onAddSet,
  onPressMore,
  onPressHeader,
  readOnly = false,
  summary,
  supersetLabel,
  registerRowRef,
  testID,
}: ExerciseBlockProps): React.ReactElement {
  const styles = useStyles();
  const hasPR = exercise.sets.some((set) => set.isPR);
  const columnWidth = numericColumnWidth(showRpe);
  const second = secondField(exercise);
  const isFocused = (setId: string, field: FocusedCell['field']): boolean =>
    focusedCell?.setId === setId && focusedCell.field === field;

  const titleRow = (
    <>
      {supersetLabel !== undefined ? (
        <Text
          style={styles.supersetLabel}
          testID={testID ? `${testID}-superset` : undefined}
        >
          {supersetLabel}
        </Text>
      ) : null}
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
    <Card testID={testID}>
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

      {note !== null ? (
        <Text style={styles.note} testID={testID ? `${testID}-note` : undefined}>
          {`Note · ${note}`}
        </Text>
      ) : null}
      {lastTimeLine !== null ? (
        <Text style={styles.lastTime}>{lastTimeLine}</Text>
      ) : null}
      {prescriptionLine !== null ? (
        <Text style={styles.prescription} testID={testID ? `${testID}-prescription` : undefined}>
          {prescriptionLine}
        </Text>
      ) : null}

      <View style={styles.columnHeader}>
        <Text style={styles.columnLabelSet}>Set</Text>
        <View style={styles.columnNumerics}>
          {numericColumns(exercise, showRpe).map((label) => (
            <Text key={label} style={[styles.columnLabel, { width: columnWidth }]}>
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
                isRepsFocused={isFocused(set.id, second)}
                isRpeFocused={isFocused(set.id, 'rpe')}
                isWeightFocused={isFocused(set.id, 'weight')}
                onPressReps={() => onFocusCell({ setId: set.id, field: second })}
                onPressRpe={() => onFocusCell({ setId: set.id, field: 'rpe' })}
                onPressWeight={() => onFocusCell({ setId: set.id, field: 'weight' })}
                onToggleComplete={() => onToggleComplete(set.id)}
                readOnly={readOnly}
                repsText={displayValue(
                  { setId: set.id, field: second },
                  second === 'duration' ? set.durationSec : set.reps,
                )}
                rowRef={(node) => registerRowRef(set.id, node)}
                rpeText={
                  showRpe
                    ? displayValue({ setId: set.id, field: 'rpe' }, set.rpe)
                    : undefined
                }
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
    </Card>
  );
}

const useStyles = createStyles((colors) => ({
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
  /** Superset position before the title, e.g. "A1". */
  supersetLabel: {
    ...type.label,
    marginRight: spacing.sm,
    fontVariant: ['tabular-nums'],
    color: colors.textMuted,
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
  /** The progression reason, one step stronger than "last time". */
  note: {
    ...type.label,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: spacing.xs,
    color: colors.textBody,
  },
  prescription: {
    ...type.label,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: spacing.xs,
    color: colors.textBody,
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
}));
