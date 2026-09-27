/**
 * One "By exercise" row: exercise name over a volume-share micro-bar, with
 * the period delta right-aligned. The row itself draws no surface; the
 * `inset` variant drops the gutter padding for rows grouped in a Card. Only
 * the fastest-improving row tints its micro-bar with the accent color;
 * every other row uses the primary color. Negative deltas are muted, never
 * the error red.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MuscleIcon, type MuscleGroup } from '@components/MuscleIcon';
import { colors, gutter, spacing, type } from '@theme';
import { formatDecimal } from '@lib/format';

import type { ExerciseProgressRow } from '../utils';

/** Minimum row height. */
const ROW_HEIGHT = 64;

/** Rendered size of the muscle-group icon. */
const MUSCLE_ICON_SIZE = 20;

/** Micro-bar geometry. */
const TRACK_WIDTH = 120;
const TRACK_HEIGHT = 2;

/** Props for {@link ExerciseDeltaRow}. */
export interface ExerciseDeltaRowProps {
  row: ExerciseProgressRow;
  /** Whether this row is the fastest-improving lift. */
  accent: boolean;
  /** Whether to draw the divider above this row. */
  dividerTop: boolean;
  /** Muscle group for the row icon; omitted when the exercise is unknown. */
  muscleGroup?: MuscleGroup;
  /**
   * `list` (default) pads the row to the screen gutter; `inset` has no
   * horizontal padding, for rows inside a Card.
   */
  variant?: 'list' | 'inset';
  onPress: () => void;
  testID?: string;
}

/** Arrow, value and color for a delta. `null` renders a muted placeholder. */
function toDeltaLabel(delta: number | null): { text: string; color: string } {
  if (delta === null) return { text: '—', color: colors.textMuted };
  const arrow = delta > 0 ? '▲' : '▼';
  return {
    text: `${arrow} ${formatDecimal(Math.abs(delta), 1)}%`,
    color: delta > 0 ? colors.success : colors.textMuted,
  };
}

/** A single exercise delta row. */
export function ExerciseDeltaRow({
  row,
  accent,
  dividerTop,
  muscleGroup,
  variant = 'list',
  onPress,
  testID,
}: ExerciseDeltaRowProps): React.ReactElement {
  const delta = toDeltaLabel(row.deltaPercent);
  const share = Math.min(Math.max(row.volumeShare, 0), 1);

  return (
    <Pressable
      accessibilityLabel={`${row.name} progress`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, variant === 'list' ? styles.rowList : null]}
      testID={testID}
    >
      {dividerTop ? <View style={styles.divider} /> : null}

      <View style={styles.body}>
        <View style={styles.left}>
          <View style={styles.nameRow}>
            {muscleGroup !== undefined ? (
              <MuscleIcon
                color={colors.textPrimary}
                group={muscleGroup}
                size={MUSCLE_ICON_SIZE}
                testID={testID ? `${testID}-muscle` : undefined}
              />
            ) : null}
            <Text numberOfLines={1} style={styles.name}>
              {row.name}
            </Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: TRACK_WIDTH * share,
                  backgroundColor: accent ? colors.accent : colors.textPrimary,
                },
              ]}
            />
          </View>
        </View>

        <Text style={[styles.delta, { color: delta.color }]}>{delta.text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: ROW_HEIGHT,
    justifyContent: 'center',
  },
  rowList: {
    paddingHorizontal: gutter,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ROW_HEIGHT,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...type.body,
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: colors.textPrimary,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    marginTop: spacing.xs,
    borderRadius: 1,
    backgroundColor: colors.hairline,
  },
  fill: {
    height: TRACK_HEIGHT,
    borderRadius: 1,
  },
  delta: {
    ...type.body,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    fontVariant: ['tabular-nums'],
  },
});
