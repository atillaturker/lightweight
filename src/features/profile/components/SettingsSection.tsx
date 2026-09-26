/**
 * One titled group of settings rows.
 *
 * Owns the section rhythm — 24px above the header, 8px below — and the
 * single hairline between consecutive rows. It never draws a hairline above
 * the first row or below the last, matching the design system.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '@components/SectionHeader';
import { colors, spacing } from '@theme';

/** Props for {@link SettingsSection}. */
export interface SettingsSectionProps {
  /** Header label, e.g. "Training" — rendered uppercase by the header. */
  label: string;
  children: React.ReactNode;
  testID?: string;
}

/** A section header followed by hairline-separated settings rows. */
export function SettingsSection({
  label,
  children,
  testID,
}: SettingsSectionProps): React.ReactElement {
  const rows = React.Children.toArray(children);

  return (
    <View style={styles.section} testID={testID}>
      <SectionHeader
        label={label}
        testID={testID ? `${testID}-header` : undefined}
      />

      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xxl,
  },
  rows: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
});
