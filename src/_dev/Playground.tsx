import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge } from "@components/Badge";
import { Button } from "@components/Button";
import { EmptyState } from "@components/EmptyState";
import { Input } from "@components/Input";
import { Pill } from "@components/Pill";
import { Radio } from "@components/Radio";
import { ScreenHeader } from "@components/ScreenHeader";
import { SectionHeader } from "@components/SectionHeader";
import { SegmentedControl } from "@components/SegmentedControl";
import { SettingsRow } from "@components/SettingsRow";
import { TabBar, type TabBarItem } from "@components/TabBar";
import { TextTabs } from "@components/TextTabs";
import { Toggle } from "@components/Toggle";
import { colors, gutter, spacing, type } from "@theme";
import type { TypeToken } from "@theme";

/**
 * DEV-ONLY playground. Renders every UI primitive built so far so the
 * design system can be verified on a real device before real screens are
 * wired up. Lives under `_dev/` and is deleted before shipping — never
 * import it from production code.
 */

/** Section titles read top-to-bottom in this fixed order. */
const SECTION_TITLES = [
  "Button",
  "Input",
  "Badge",
  "Toggle",
  "SegmentedControl",
  "TextTabs",
  "TabBar",
  "ScreenHeader",
  "SectionHeader",
  "SettingsRow",
  "Pill",
  "Radio",
  "EmptyState",
  "Typography",
] as const;

/** Every type token, in the order it should be reviewed. */
const TYPE_TOKENS: TypeToken[] = [
  "displayLarge",
  "display",
  "headline",
  "sectionTitle",
  "metricHero",
  "metricLarge",
  "metric",
  "bodyLarge",
  "body",
  "bodySmall",
  "label",
  "labelSmall",
  "caption",
  "button",
  "buttonSmall",
];

const TYPE_SAMPLE = "The quick brown fox 0123456789";

/** Destinations wired into the fixed demo TabBar. */
const TAB_ITEMS: TabBarItem[] = [
  { key: "today", label: "Today", icon: "today" },
  { key: "progress", label: "Progress", icon: "progress" },
  { key: "history", label: "History", icon: "history" },
  { key: "profile", label: "Profile", icon: "profile" },
];

/** Filter labels for the Pill section. */
const PILL_LABELS = ["All", "Chest", "Back", "Legs", "Arms"];

/** Unit options for the Radio section. */
const RADIO_OPTIONS = [
  "Kilograms (kg)",
  "Pounds (lb)",
  "Stone (st)",
  "Custom",
];

/**
 * A 16px plus sign. `react-native-svg` is not installed and new
 * dependencies are forbidden, so the glyph is drawn from two plain
 * `View`s instead of an inline SVG path.
 */
function PlusIcon({ color }: { color: string }): React.ReactElement {
  return (
    <View style={styles.icon}>
      <View style={[styles.iconBarHorizontal, { backgroundColor: color }]} />
      <View style={[styles.iconBarVertical, { backgroundColor: color }]} />
    </View>
  );
}

/** Section 1 — every Button variant and state. */
function ButtonSection(): React.ReactElement {
  return (
    <View style={styles.stackMd}>
      <Button label="Log set" onPress={noop} variant="primary" />
      <Button
        label="Continue with Apple"
        onPress={noop}
        variant="secondary"
      />
      <Button
        label="I already have an account"
        onPress={noop}
        variant="text"
      />
      <Button label="Saving…" loading onPress={noop} variant="primary" />
      <Button disabled label="Disabled" onPress={noop} variant="primary" />
      <Button
        fullWidth
        label="Continue"
        onPress={noop}
        variant="primary"
      />
      <Button
        icon={<PlusIcon color={colors.textInverse} />}
        label="Add exercise"
        onPress={noop}
        variant="primary"
      />
    </View>
  );
}

/** Password field with an overlay reveal accessory (see judgment calls). */
function PasswordField(): React.ReactElement {
  const [value, setValue] = useState("correcthorse");
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.accessoryHost}>
      <Input
        label="Password"
        onChangeText={setValue}
        secureTextEntry={hidden}
        value={value}
      />
      <Pressable
        accessibilityLabel={hidden ? "Show password" : "Hide password"}
        accessibilityRole="button"
        onPress={() => setHidden((previous) => !previous)}
        style={styles.accessory}
      >
        <Text style={styles.accessoryGlyph}>👁</Text>
      </Pressable>
    </View>
  );
}

/** Section 2 — interactive, controlled inputs. */
function InputSection(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState("not-an-email");
  const [helperValue, setHelperValue] = useState("");

  return (
    <View style={styles.stackXxl}>
      <Input
        label="Email"
        onChangeText={setEmail}
        placeholder="you@example.com"
        value={email}
      />
      <PasswordField />
      <Input
        error="Enter a valid email address."
        label="Email"
        onChangeText={setInvalidEmail}
        value={invalidEmail}
      />
      <Input
        helperText="At least 8 characters."
        label="Password"
        onChangeText={setHelperValue}
        value={helperValue}
      />
    </View>
  );
}

/** Section 3 — Badge. Both variants must look identical. */
function BadgeSection(): React.ReactElement {
  return (
    <View style={styles.row}>
      <Badge label="PR" />
      <Badge label="PR" variant="pr" />
    </View>
  );
}

/** One labelled Toggle row with a hairline separator. */
function ToggleRow({
  label,
  value,
  onChange,
  disabled = false,
  last = false,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}): React.ReactElement {
  return (
    <View style={[styles.toggleRow, !last && styles.toggleRowDivider]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Toggle disabled={disabled} onChange={onChange} value={value} />
    </View>
  );
}

/** Section 4 — Toggle rows. */
function ToggleSection(): React.ReactElement {
  const [rpe, setRpe] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <View>
      <ToggleRow label="RPE field" onChange={setRpe} value={rpe} />
      <ToggleRow
        label="Notifications"
        onChange={setNotifications}
        value={notifications}
      />
      <ToggleRow
        disabled
        label="Auto rest"
        last
        onChange={noop}
        value={false}
      />
    </View>
  );
}

/** Section 5 — SegmentedControl instances. */
function SegmentedSection(): React.ReactElement {
  const [range, setRange] = useState("12W");
  const [split, setSplit] = useState("Upper");

  return (
    <View style={styles.stackXxl}>
      <SegmentedControl
        onChange={setRange}
        options={RANGE_OPTIONS}
        value={range}
      />
      <SegmentedControl
        onChange={setSplit}
        options={SPLIT_OPTIONS}
        value={split}
      />
    </View>
  );
}

/** Section 6 — TextTabs, static and horizontally scrollable. */
function TextTabsSection(): React.ReactElement {
  const [metric, setMetric] = useState("1RM");
  const [range, setRange] = useState("Volume");

  return (
    <View style={styles.stackXxxl}>
      <TextTabs
        onChange={setMetric}
        options={METRIC_TABS}
        scrollable={false}
        value={metric}
      />
      <TextTabs
        onChange={setRange}
        options={RANGE_TABS}
        scrollable
        value={range}
      />
    </View>
  );
}

/**
 * Section 7 — the fixed TabBar lives at the root of the screen (see
 * `Playground`); this section only carries its label.
 */
function TabBarSection(): React.ReactElement {
  return (
    <Text style={styles.note}>
      Fixed to the bottom of the screen — selection is color-only.
    </Text>
  );
}

/**
 * A 13px Inter Medium text action with no handler. Used for the right
 * slots of ScreenHeader and SectionHeader demos.
 */
function TextAction({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "muted";
}): React.ReactElement {
  return (
    <Pressable accessibilityRole="button" onPress={noop}>
      <Text
        style={[
          styles.textAction,
          tone === "muted" ? styles.textActionMuted : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Section 8 — ScreenHeader with each slot combination. */
function ScreenHeaderSection(): React.ReactElement {
  return (
    <View style={styles.stackXxl}>
      <View style={styles.demoBox}>
        <ScreenHeader title="History" showBack={false} />
      </View>
      <View style={styles.demoBox}>
        <ScreenHeader showBack title="Bench Press" />
      </View>
      <View style={styles.demoBox}>
        <ScreenHeader
          rightAction={<TextAction label="Edit" tone="primary" />}
          showBack
          title="Progress"
        />
      </View>
    </View>
  );
}

/** Section 9 — SectionHeader with and without an action. */
function SectionHeaderSection(): React.ReactElement {
  return (
    <View style={styles.stackXxl}>
      <SectionHeader label="TRAINING" />
      <SectionHeader
        action={<TextAction label="See all" tone="muted" />}
        label="DATA"
      />
      <SectionHeader
        action={<TextAction label="Sort" tone="muted" />}
        label="APP"
      />
    </View>
  );
}

/** Section 10 — SettingsRow, one demo per variant. */
function SettingsRowSection(): React.ReactElement {
  const [rpe, setRpe] = useState(false);
  const [notifications, setNotifications] = useState(false);

  return (
    <View>
      <SettingsRow label="Units" value="Kilograms" variant="value" />
      <Divider />
      <SettingsRow label="Week starts on" value="Monday" variant="value" />
      <Divider />
      <SettingsRow
        label="RPE field"
        onToggleChange={setRpe}
        toggleValue={rpe}
        variant="toggle"
      />
      <Divider />
      <SettingsRow
        label="Notifications"
        onToggleChange={setNotifications}
        toggleValue={notifications}
        variant="toggle"
      />
      <Divider />
      <SettingsRow label="Export data" variant="chevron" />
      <Divider />
      <SettingsRow label="Import data" variant="chevron" />
      <Divider />
      <SettingsRow label="Delete all workouts" variant="destructive" />
      <Divider />
      <SettingsRow label="Sign out" onPress={noop} variant="plain" />
    </View>
  );
}

/** Section 11 — Pill, an interactive filter chip row. */
function PillSection(): React.ReactElement {
  const [selected, setSelected] = useState("All");

  return (
    <View style={styles.row}>
      {PILL_LABELS.map((label) => (
        <Pill
          key={label}
          label={label}
          onPress={() => setSelected(label)}
          selected={selected === label}
        />
      ))}
    </View>
  );
}

/** Section 12 — Radio options in isolation with hairline separators. */
function RadioSection(): React.ReactElement {
  const [selected, setSelected] = useState("Kilograms (kg)");

  return (
    <View>
      {RADIO_OPTIONS.map((label, index) => (
        <View
          key={label}
          style={index < RADIO_OPTIONS.length - 1 ? styles.rowDivider : null}
        >
          <Radio
            label={label}
            onPress={() => setSelected(label)}
            selected={selected === label}
          />
        </View>
      ))}
    </View>
  );
}

/** Section 13 — EmptyState with and without an action. */
function EmptyStateSection(): React.ReactElement {
  return (
    <View style={styles.stackHuge}>
      <EmptyState
        message="Your history will appear here."
        title="No sessions yet"
      />
      <EmptyState
        action={
          <Button label="Clear filter" onPress={noop} variant="text" />
        }
        message="Try clearing the filter to see more."
        title="No data for this filter"
      />
    </View>
  );
}

/** Section 14 — every type token rendered at its real size. */
function TypographySection(): React.ReactElement {
  return (
    <View style={styles.stackMd}>
      {TYPE_TOKENS.map((token) => (
        <View key={token}>
          <Text style={styles.tokenName}>{token}</Text>
          <Text style={[type[token], styles.tokenSample]}>{TYPE_SAMPLE}</Text>
        </View>
      ))}
    </View>
  );
}

/** Placeholder callback for the non-functional demo rows. */
function noop(): void {}

/** 1px hairline used to separate stacked demo rows. */
function Divider(): React.ReactElement {
  return <View style={styles.divider} />;
}

const RANGE_OPTIONS = [
  { value: "4W", label: "4W" },
  { value: "12W", label: "12W" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
];

const SPLIT_OPTIONS = [
  { value: "Upper", label: "Upper" },
  { value: "Lower", label: "Lower" },
];

const METRIC_TABS = [
  { value: "1RM", label: "1RM" },
  { value: "Volume", label: "Volume" },
  { value: "Reps", label: "Reps" },
];

const RANGE_TABS = [
  { value: "Volume", label: "Volume" },
  { value: "Sets", label: "Sets" },
  { value: "Reps", label: "Reps" },
  { value: "Time", label: "Time" },
  { value: "Sessions", label: "Sessions" },
];

/** Renders one titled section with the canonical 16px/40px rhythm. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

/**
 * The playground screen. A single vertical `ScrollView` on the canvas
 * background, one primitive per section, in `SECTION_TITLES` order, with
 * the interactive `TabBar` fixed to the bottom of the screen.
 */
export default function Playground(): React.ReactElement {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <Section title={SECTION_TITLES[0]}>
          <ButtonSection />
        </Section>
        <Section title={SECTION_TITLES[1]}>
          <InputSection />
        </Section>
        <Section title={SECTION_TITLES[2]}>
          <BadgeSection />
        </Section>
        <Section title={SECTION_TITLES[3]}>
          <ToggleSection />
        </Section>
        <Section title={SECTION_TITLES[4]}>
          <SegmentedSection />
        </Section>
        <Section title={SECTION_TITLES[5]}>
          <TextTabsSection />
        </Section>
        <Section title={SECTION_TITLES[6]}>
          <TabBarSection />
        </Section>
        <Section title={SECTION_TITLES[7]}>
          <ScreenHeaderSection />
        </Section>
        <Section title={SECTION_TITLES[8]}>
          <SectionHeaderSection />
        </Section>
        <Section title={SECTION_TITLES[9]}>
          <SettingsRowSection />
        </Section>
        <Section title={SECTION_TITLES[10]}>
          <PillSection />
        </Section>
        <Section title={SECTION_TITLES[11]}>
          <RadioSection />
        </Section>
        <Section title={SECTION_TITLES[12]}>
          <EmptyStateSection />
        </Section>
        <Section title={SECTION_TITLES[13]}>
          <TypographySection />
        </Section>
      </ScrollView>

      <View style={styles.tabBarHost}>
        <TabBar
          activeKey={activeTab}
          items={TAB_ITEMS}
          onSelect={setActiveTab}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: gutter,
    paddingTop: spacing.giant,
    // 80px = giant + xxl, keeping the last section clear of the fixed TabBar.
    paddingBottom: spacing.giant + spacing.xxl,
  },
  tabBarHost: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  // ─── Section rhythm ───────────────────────────────────
  section: {
    marginBottom: spacing.huge,
  },
  sectionTitle: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },
  sectionBody: {
    marginTop: spacing.lg,
  },

  // ─── Layout helpers ───────────────────────────────────
  stackMd: {
    gap: spacing.md,
  },
  stackXxl: {
    gap: spacing.xxl,
  },
  stackXxxl: {
    gap: spacing.xxxl,
  },
  stackHuge: {
    gap: spacing.huge,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  // ─── Demo chrome ──────────────────────────────────────
  demoBox: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  note: {
    ...type.caption,
    color: colors.textMuted,
  },
  textAction: {
    ...type.label,
    color: colors.textPrimary,
  },
  textActionMuted: {
    color: colors.textMuted,
  },

  // ─── Inline plus icon ─────────────────────────────────
  icon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBarHorizontal: {
    position: "absolute",
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  iconBarVertical: {
    position: "absolute",
    width: 2,
    height: 16,
    borderRadius: 1,
  },

  // ─── Input reveal accessory ───────────────────────────
  accessoryHost: {
    position: "relative",
  },
  /**
   * Sits inside the 52px field box: label line (18) + its 8px margin.
   */
  accessory: {
    position: "absolute",
    top: 26,
    right: spacing.lg,
    height: 52,
    justifyContent: "center",
  },
  accessoryGlyph: {
    ...type.bodyLarge,
    color: colors.textMuted,
  },

  // ─── Toggle rows ──────────────────────────────────────
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
  },
  toggleRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  toggleLabel: {
    ...type.body,
    color: colors.textPrimary,
  },

  // ─── Typography reference ─────────────────────────────
  tokenName: {
    ...type.labelSmall,
    color: colors.textMuted,
  },
  tokenSample: {
    color: colors.textPrimary,
  },
});
