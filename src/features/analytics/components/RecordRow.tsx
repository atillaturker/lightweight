/**
 * One row of the Exercise Detail "Personal records" list: label (with an
 * optional PR pill) over the date achieved, value right-aligned. Sits
 * inside the screen's Card, which owns the horizontal padding; hairline
 * separators are drawn as the row's top edge.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@components/Badge';
import { colors, fineSpacing, spacing, type } from '@theme';

/** Minimum row height. */
const ROW_HEIGHT = 56;

/** Props for {@link RecordRow}. */
export interface RecordRowProps {
  label: string;
  dateText: string;
  valueText: string;
  /** Whether to render the "PR" pill beside the label. */
  showBadge: boolean;
  /** Whether to draw the divider above this row. */
  dividerTop: boolean;
  testID?: string;
}

/** A single historical-best row. */
export function RecordRow({
  label,
  dateText,
  valueText,
  showBadge,
  dividerTop,
  testID,
}: RecordRowProps): React.ReactElement {
  return (
    <View style={styles.wrap} testID={testID}>
      {dividerTop ? <View style={styles.divider} /> : null}

      <View style={styles.body}>
        <View style={styles.left}>
          <View style={styles.labelRow}>
            <Text numberOfLines={1} style={styles.label}>
              {label}
            </Text>
            {showBadge ? (
              <View style={styles.badge}>
                <Badge label="PR" variant="pr" />
              </View>
            ) : null}
          </View>
          <Text numberOfLines={1} style={styles.date}>
            {dateText}
          </Text>
        </View>

        <Text style={styles.value}>{valueText}</Text>
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
    minHeight: ROW_HEIGHT - 1,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...type.body,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textPrimary,
  },
  badge: {
    marginLeft: spacing.sm,
  },
  date: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },
  value: {
    ...type.body,
    marginLeft: spacing.md,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
});
