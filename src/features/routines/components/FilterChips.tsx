/**
 * A horizontally scrolling row of filter chips (DESIGN.md §10 "Chips and
 * filters"): outline when idle, accent border and label when selected,
 * never filled. Selection logic belongs to the caller.
 */
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { createStyles, fineSpacing, gutter, radii, spacing, type } from "@theme";

/** One chip. */
export interface FilterChipOption<K extends string> {
  key: K;
  label: string;
}

/** Props for {@link FilterChips}. */
export interface FilterChipsProps<K extends string> {
  options: readonly FilterChipOption<K>[];
  isSelected: (key: K) => boolean;
  onPress: (key: K) => void;
  /** Spoken name of the row, e.g. "Equipment". */
  accessibilityLabel: string;
  testID?: string;
}

/** Scrollable chip row. */
export function FilterChips<K extends string>({
  options,
  isSelected,
  onPress,
  accessibilityLabel,
  testID,
}: FilterChipsProps<K>): React.ReactElement {
  const styles = useStyles();
  return (
    <View accessibilityLabel={accessibilityLabel} testID={testID}>
      <ScrollView
        contentContainerStyle={styles.content}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
      >
        {options.map((option) => {
          const selected = isSelected(option.key);
          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.key}
              onPress={() => onPress(option.key)}
              style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle]}
              testID={testID ? `${testID}-${option.key}` : undefined}
            >
              <Text style={[styles.label, selected && styles.labelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  content: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: gutter,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    paddingHorizontal: fineSpacing.loose,
    borderRadius: radii.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
  },
  chipIdle: { borderColor: colors.hairline },
  chipSelected: { borderColor: colors.accent },
  label: { ...type.label, color: colors.textBody },
  labelSelected: { color: colors.accent },
}));
