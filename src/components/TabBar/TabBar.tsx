import React, { useCallback } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabIcons } from "./TabBar.icons";
import {
  styles,
  TAB_ACTIVE_COLOR,
  TAB_BAR_HEIGHT,
  TAB_INACTIVE_COLOR,
} from "./TabBar.styles";

/** One destination in the bottom navigation bar. */
export interface TabBarItem {
  /** Stable identity passed back to `onSelect`. */
  key: string;
  /** Single-line label rendered under the icon. */
  label: string;
  /** Which locked monoline glyph to draw. */
  icon: "today" | "progress" | "history" | "profile";
}

/**
 * Props for {@link TabBar}. Layout and accessibility props other than
 * `style` are forwarded to the container.
 */
export interface TabBarProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  /** Destinations, rendered left to right at equal width. */
  items: TabBarItem[];
  /** Key of the currently selected item. */
  activeKey: string;
  /** Called with the pressed item's key. */
  onSelect: (key: string) => void;
  testID?: string;
}

/** Props for a single tab: its item, whether it is active, and handlers. */
interface TabProps {
  item: TabBarItem;
  active: boolean;
  testID?: string;
  onPress: () => void;
}

/**
 * One destination. Icon and label share a single color derived from the
 * active state — there is no background, indicator, or surface treatment.
 */
function Tab({ item, active, testID, onPress }: TabProps): React.ReactElement {
  const color = active ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR;
  const Icon = TabIcons[item.icon];

  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.item}
      testID={testID}
    >
      <Icon color={color} />
      <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

/**
 * Bottom navigation bar. Renders equal-width destinations over a 1px top
 * hairline, at 56px plus the bottom safe-area inset. Selection is expressed
 * by color alone — never by a pill, indicator bar, badge, or dot.
 *
 * Typical use: the custom tab bar mounted by the main navigator, replacing
 * the default React Navigation tab bar.
 */
export function TabBar({
  items,
  activeKey,
  onSelect,
  testID,
  ...rest
}: TabBarProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  const handleSelect = useCallback(
    (key: string) => {
      if (key === activeKey) return;

      onSelect(key);
    },
    [activeKey, onSelect],
  );

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        { minHeight: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
      ]}
      testID={testID}
      {...rest}
    >
      {items.map((item) => (
        <Tab
          active={item.key === activeKey}
          item={item}
          key={item.key}
          onPress={() => handleSelect(item.key)}
          testID={testID ? `${testID}-${item.key}` : undefined}
        />
      ))}
    </View>
  );
}
