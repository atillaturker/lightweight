/**
 * Post-workout personal-records section.
 *
 * One row per exercise that set a record during the session: the exercise
 * name, a plain-language description of the record, and the same "PR" pill
 * the set table shows. Rows are separated by hairlines only — no card, no
 * per-row surface, no icon.
 *
 * Renders `null` when the session set no records, so the caller can place
 * it unconditionally and the section disappears on an ordinary session.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@components/Badge';
import { colors, fineSpacing, spacing, type } from '@theme';

import type { PRSummaryRow } from '../utils/prSummary';

/** Row height, per the list-row rule. */
const PR_ROW_HEIGHT = 56;

/** Props for {@link PRSection}. */
export interface PRSectionProps {
  /** One entry per exercise that set a record. */
  rows: PRSummaryRow[];
  testID?: string;
}

/**
 * "Personal records" header with a count, followed by one row per record.
 * The count is muted text, not a badge — the pill on each row is already
 * the badge.
 */
export function PRSection({
  rows,
  testID,
}: PRSectionProps): React.ReactElement | null {
  if (rows.length === 0) return null;

  return (
    <View testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Personal records</Text>
        <Text style={styles.headerCount}>{`${rows.length} new`}</Text>
      </View>

      <View style={styles.list}>
        {rows.map((row, index) => (
          <View key={row.exerciseId}>
            {index > 0 ? <View style={styles.divider} /> : null}

            <View
              style={styles.row}
              testID={testID ? `${testID}-${row.exerciseId}` : undefined}
            >
              <View style={styles.text}>
                <Text numberOfLines={1} style={styles.name}>
                  {row.exerciseName}
                </Text>
                <Text numberOfLines={1} style={styles.description}>
                  {row.description}
                </Text>
              </View>

              <Badge label="PR" variant="pr" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },
  headerCount: {
    ...type.label,
    color: colors.textMuted,
  },
  list: {
    marginTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  row: {
    minHeight: PR_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  name: {
    ...type.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  /** 2px below the exercise name. */
  description: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },
});
