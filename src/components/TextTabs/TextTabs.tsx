import React, { useCallback } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { styles } from "./TextTabs.styles";

/** A single text tab. */
export interface TextTabsOption {
  value: string;
  label: string;
}

/**
 * Controlled text-only tabs. Exactly one `value` is active; pressing
 * the active tab is a no-op so `onChange` fires only on a real change.
 *
 * Set `scrollable` when the tabs may overflow the screen width — the
 * component then renders a horizontal `ScrollView` with no scroll
 * indicator. Full-bleed alignment is the parent's responsibility.
 */
export interface TextTabsProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  options: TextTabsOption[];
  value: string;
  onChange: (value: string) => void;
  scrollable?: boolean;
  testID?: string;
}

/** Props handed down to each pressable tab. */
type TabPressProps = Omit<PressableProps, "style" | "children" | "onPress">;

/**
 * One tab: label plus the always-mounted 2px underline, which is made
 * transparent when inactive so the row height never shifts.
 */
function Tab({
  label,
  active,
  testID,
  onPress,
}: {
  label: string;
  active: boolean;
  testID?: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      testID={testID}
      style={styles.tab}
    >
      <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>
        {label}
      </Text>
      <View style={[styles.underline, !active && styles.underlineHidden]} />
    </Pressable>
  );
}

/** Maps the option list onto tabs, deriving per-tab state and testIDs. */
function TabList({
  options,
  value,
  testID,
  onSelect,
}: {
  options: TextTabsOption[];
  value: string;
  testID?: string;
  onSelect: (value: string) => void;
}): React.ReactElement {
  return (
    <>
      {options.map((option) => (
        <Tab
          active={option.value === value}
          key={option.value}
          label={option.label}
          onPress={() => onSelect(option.value)}
          testID={testID ? `${testID}-${option.value}` : undefined}
        />
      ))}
    </>
  );
}

/**
 * The container: a horizontal `ScrollView` when `scrollable`, otherwise
 * a static row. Passes `...rest` through so consumers can attach
 * accessibility and layout props.
 */
function TabRow({
  scrollable,
  testID,
  children,
  ...rest
}: TabPressProps & {
  scrollable: boolean;
  testID?: string;
  children: React.ReactNode;
}): React.ReactElement {
  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        testID={testID}
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View accessibilityRole="tablist" style={styles.row} testID={testID} {...rest}>
      {children}
    </View>
  );
}

/**
 * Shared text-tab row. No pills, backgrounds, or borders — the active
 * tab is marked only by heavier text and a 2px primary underline.
 *
 * Typical use: a metric selector (1RM / Volume / Reps).
 */
export function TextTabs({
  options,
  value,
  onChange,
  scrollable = false,
  testID,
  ...rest
}: TextTabsProps): React.ReactElement {
  const handleSelect = useCallback(
    (nextValue: string) => {
      if (nextValue === value) return;

      onChange(nextValue);
    },
    [onChange, value],
  );

  return (
    <TabRow scrollable={scrollable} testID={testID} {...rest}>
      <TabList
        onSelect={handleSelect}
        options={options}
        testID={testID}
        value={value}
      />
    </TabRow>
  );
}
