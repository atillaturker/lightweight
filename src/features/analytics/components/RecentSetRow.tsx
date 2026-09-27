/**
 * One row of the Exercise Detail "Recent sets" list: date on the left, set
 * summary right-aligned. Sits inside the screen's Card, which owns the
 * horizontal padding; hairline separators are drawn as the row's top edge.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@theme';

/** Minimum row height. */
const ROW_HEIGHT = 44;

/** Props for {@link RecentSetRow}. */
export interface RecentSetRowProps {
  dateText: string;
  summaryText: string;
  /** Whether to draw the divider above this row. */
  dividerTop: boolean;
  testID?: string;
}

/** A single recent-session row. */
export function RecentSetRow({
  dateText,
  summaryText,
  dividerTop,
  testID,
}: RecentSetRowProps): React.ReactElement {
  return (
    <View style={styles.wrap} testID={testID}>
      {dividerTop ? <View style={styles.divider} /> : null}

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.date}>
          {dateText}
        </Text>
        <Text numberOfLines={1} style={styles.summary}>
          {summaryText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: ROW_HEIGHT,
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: ROW_HEIGHT - 1,
    gap: spacing.md,
  },
  date: {
    ...type.bodySmall,
    color: colors.textMuted,
  },
  summary: {
    ...type.body,
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
});
