/**
 * One selectable numeric value shared by the routine editor's bottom
 * sheets (targets and estimated duration).
 *
 * Selected is a solid primary fill with no border; unselected is a white
 * pill with a hairline border. Kept in one place so both sheets stay
 * pixel-identical.
 */
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, type } from '@theme';

/** Props for {@link ValuePill}. */
export interface ValuePillProps {
  value: number;
  selected: boolean;
  onPress: () => void;
}

/** A single pill option. */
export function ValuePill({
  value,
  selected,
  onPress,
}: ValuePillProps): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={String(value)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.pill, selected ? styles.pillSelected : styles.pillIdle]}
    >
      <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
    borderRadius: radii.pill,
  },
  pillIdle: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  pillSelected: {
    backgroundColor: colors.primary,
  },
  pillLabel: {
    ...type.label,
    color: colors.textPrimary,
  },
  pillLabelSelected: {
    ...type.label,
    color: colors.textInverse,
  },
});
