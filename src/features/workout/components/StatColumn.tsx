/**
 * Stat column primitives for the Home strip and the Summary stats strip.
 *
 * Both strips are the same object: a value with a label above and an
 * optional caption below. The value always uses tabular figures — this is
 * the only place numbers are typeset on these screens, so the rule cannot
 * drift.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LineIcon, type LineIconName } from '@components/LineIcon';
import { colors, fineSpacing, spacing, type } from '@theme';

/** Props for {@link StatColumn}. */
export interface StatColumnProps {
  /** Uppercase label above the value. */
  label: string;
  /**
   * Optional 16px glyph before the label, only where a natural symbol
   * exists (e.g. a flame for streak) — v3 rule 6.
   */
  icon?: LineIconName;
  /** The value itself, already formatted. */
  value: string;
  /** Optional caption under the value. */
  caption?: string;
  /** Caption color. Defaults to muted; success is allowed for a rise. */
  captionColor?: string;
  testID?: string;
}

/**
 * One column of a stat strip: label, tabular value, optional caption.
 * Renders no surface, border, or card.
 */
export function StatColumn({
  label,
  icon,
  value,
  caption,
  captionColor,
  testID,
}: StatColumnProps): React.ReactElement {
  return (
    <View style={styles.column} testID={testID}>
      <View style={styles.labelRow}>
        {icon !== undefined ? (
          <LineIcon name={icon} testID={testID ? `${testID}-icon` : undefined} />
        ) : null}
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.value}>
        {value}
      </Text>
      {caption !== undefined ? (
        <Text
          numberOfLines={1}
          style={[styles.caption, captionStyle(captionColor)]}
        >
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * A row of stat columns separated by full-height hairlines. Dividers are
 * drawn between columns only — never on the outer edges.
 */
export function StatStrip({ children }: { children: React.ReactNode }): React.ReactElement {
  return <View style={styles.strip}>{children}</View>;
}

/**
 * Caption color override. Returns a style object only when the caller
 * asked for one, so the common case stays on the static stylesheet.
 */
function captionStyle(color: string | undefined): { color: string } | null {
  return color === undefined ? null : { color };
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fineSpacing.tight,
  },
  label: {
    ...type.labelSmall,
    flexShrink: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  /** 6px below the label, per the stat-strip spec. */
  value: {
    ...type.metricLarge,
    marginTop: spacing.xs + 2,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  /** 4px below the value. */
  caption: {
    ...type.caption,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
});
