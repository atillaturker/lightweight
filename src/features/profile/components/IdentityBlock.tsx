/**
 * The signed-in user's identity block: a 56px initials avatar, name,
 * email, and a muted chevron. The whole block is one tap target; it draws
 * no card, border, or background.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, radii, spacing, type } from '@theme';

import { displayNameFor, initialsFor } from '../utils';

/** Rendered edge length of the identity chevron. */
const CHEVRON_SIZE = 16;

/** Props for {@link IdentityBlock}. */
export interface IdentityBlockProps {
  name: string | null;
  email: string | null;
  onPress?: () => void;
  testID?: string;
}

/** Identity row shown at the top of the Profile screen. */
export function IdentityBlock({
  name,
  email,
  onPress,
  testID,
}: IdentityBlockProps): React.ReactElement {
  const displayName = displayNameFor(name, email);
  const displayEmail = email?.trim() ? email.trim() : '—';

  return (
    <Pressable
      accessibilityLabel="Account"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.row}
      testID={testID}
    >
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initialsFor(name, email)}</Text>
      </View>

      <View style={styles.textColumn}>
        <Text numberOfLines={1} style={styles.name}>
          {displayName}
        </Text>
        <Text numberOfLines={1} style={styles.email}>
          {displayEmail}
        </Text>
      </View>

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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...type.metricLarge,
    fontSize: 20,
    color: colors.textPrimary,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: spacing.lg,
  },
  name: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },
  email: {
    ...type.bodySmall,
    marginTop: 2,
    color: colors.textMuted,
  },
});
