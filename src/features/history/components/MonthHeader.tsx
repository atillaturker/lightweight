/**
 * Sticky month header for the History list.
 *
 * A flat 32px label band on the canvas with a single bottom hairline; it
 * carries no shadow or tint, per the History design.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, gutter, type } from '@theme';

/** Props for {@link MonthHeader}. */
export interface MonthHeaderProps {
  /** Uppercase label, e.g. `APRIL 2026`. */
  title: string;
  testID?: string;
}

/** The month label that stays pinned while its rows scroll. */
export function MonthHeader({
  title,
  testID,
}: MonthHeaderProps): React.ReactElement {
  return (
    <View style={styles.header} testID={testID}>
      <Text style={styles.label}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * Flat 32px label band on the canvas with a single bottom hairline. It
   * stays a plain band rather than a soft block: the list already has one
   * surface grouping job, and a tinted band would read as a chip. The
   * label carries the v2 section-header presence instead.
   */
  header: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: gutter,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  label: {
    ...type.caption,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
