import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge } from "@components/Badge";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { SegmentedControl } from "@components/SegmentedControl";
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

/** Section 7 — every type token rendered at its real size. */
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
 * background, one primitive per section, in `SECTION_TITLES` order.
 */
export default function Playground(): React.ReactElement {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
    >
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
        <TypographySection />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: gutter,
    paddingTop: spacing.giant,
    paddingBottom: spacing.giant,
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
  row: {
    flexDirection: "row",
    gap: spacing.sm,
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
