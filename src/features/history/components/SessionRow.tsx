/**
 * One past session in the History list.
 *
 * A plain row: routine name and summary line on the left, session volume
 * right-aligned in a fixed column, and a muted chevron. The hairline
 * between rows is drawn as the row's top divider so it can never appear
 * above the first row of a month or below the last.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Workout } from '@domain/entities';
import { colors, gutter, spacing, type } from '@theme';

import { toHistoryRow } from '../utils';

/** Rendered edge length of the row chevron. */
const CHEVRON_SIZE = 16;

/** Fixed width of the right-aligned volume column. */
const VOLUME_COLUMN_WIDTH = 64;

/** Props for {@link SessionRow}. */
export interface SessionRowProps {
  session: Workout;
  /** Current time, used for the duration line. */
  now: number;
  /** Whether to draw the divider above this row. */
  dividerTop: boolean;
  onPress: () => void;
  testID?: string;
}

/** A single finished-session row. */
export function SessionRow({
  session,
  now,
  dividerTop,
  onPress,
  testID,
}: SessionRowProps): React.ReactElement {
  const row = toHistoryRow(session, now);

  return (
    <Pressable
      accessibilityLabel={row.title}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.row}
      testID={testID}
    >
      {dividerTop ? <View style={styles.divider} /> : null}

      <View style={styles.body}>
        <View style={styles.left}>
          <Text numberOfLines={1} style={styles.title}>
            {row.title}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {row.meta}
          </Text>
        </View>

        <Text style={styles.volume}>{row.volume}</Text>

        <View style={styles.chevron}>
          <Svg
            fill="none"
            height={CHEVRON_SIZE}
            stroke={colors.textMuted}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            width={CHEVRON_SIZE}
          >
            <Path d="M9 6l6 6-6 6" />
          </Svg>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: gutter,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 55,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...type.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  meta: {
    ...type.bodySmall,
    marginTop: 2,
    color: colors.textMuted,
  },
  volume: {
    ...type.label,
    width: VOLUME_COLUMN_WIDTH,
    marginLeft: spacing.md,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    color: colors.textPrimary,
  },
  chevron: {
    width: 20,
    marginLeft: spacing.sm,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
