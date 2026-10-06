/**
 * Profile tab root: the signed-in identity plus training, data, and app
 * settings.
 *
 * Every setting writes straight to the persisted preferences store — there
 * is no primary CTA and no "Save". Units, week start, rest timer, and appearance each
 * open a single-select sheet; RPE and notifications are inline toggles.
 * The rest duration is read by the workout feature through its provider
 * seam, so changing it here changes the next set's rest timer.
 *
 * The Data rows export a JSON backup, import a backup or shared routine
 * file, and delete every workout (`useDataActions`).
 */
import React, { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenHeader } from "@components/ScreenHeader";
import { SettingsRow } from "@components/SettingsRow";
import type { Appearance, WeekStart, WeightUnit } from "@domain/entities";
import { useAuthStore, useSignInActions } from "@features/auth";
import { formatClock } from "@lib/format";
import { gutter, spacing, createStyles } from "@theme";

import {
  IdentityBlock,
  OptionSheet,
  SettingsSection,
  type OptionSheetOption,
} from "../components";
import { APP_VERSION, REST_TIMER_SECONDS_OPTIONS } from "../config";
import { useDataActions } from "../hooks";
import { useAppearanceStore, usePreferencesStore } from "../store";

import type { ProfileStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "Profile">;


/** Which preference sheet is open, if any. */
type SheetKind = "units" | "weekStart" | "rest" | "appearance";

/** Unit choices shown in the Units sheet. */
const UNIT_OPTIONS: readonly OptionSheetOption<WeightUnit>[] = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
];

/** Week-boundary choices shown in the Week starts on sheet. */
const WEEK_START_OPTIONS: readonly OptionSheetOption<WeekStart>[] = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
];

/** Human labels for the Week starts on row value. */
const WEEK_START_LABELS: Record<WeekStart, string> = {
  monday: "Monday",
  sunday: "Sunday",
};

/** Theme choices shown in the Appearance sheet. */
const APPEARANCE_OPTIONS: readonly OptionSheetOption<Appearance>[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** Human labels for the Appearance row value. */
const APPEARANCE_LABELS: Record<Appearance, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

/** Rest durations, labelled as `m:ss`. */
const REST_OPTIONS: readonly OptionSheetOption<number>[] =
  REST_TIMER_SECONDS_OPTIONS.map((value) => ({
    value,
    label: formatClock(value),
  }));

/** Root screen of the Profile tab. */
export function ProfileScreen({ navigation }: Props): React.ReactElement {
  const styles = useStyles();
  const user = useAuthStore((state) => state.user);
  const { signOut } = useSignInActions();

  const unit = usePreferencesStore((state) => state.unit);
  const weekStart = usePreferencesStore((state) => state.weekStart);
  const rpeEnabled = usePreferencesStore((state) => state.rpeEnabled);
  const restTimerSeconds = usePreferencesStore(
    (state) => state.restTimerSeconds,
  );
  const notificationsEnabled = usePreferencesStore(
    (state) => state.notificationsEnabled,
  );
  const setUnit = usePreferencesStore((state) => state.setUnit);
  const setWeekStart = usePreferencesStore((state) => state.setWeekStart);
  const setRpeEnabled = usePreferencesStore((state) => state.setRpeEnabled);
  const setRestTimerSeconds = usePreferencesStore(
    (state) => state.setRestTimerSeconds,
  );
  const setNotificationsEnabled = usePreferencesStore(
    (state) => state.setNotificationsEnabled,
  );

  const appearance = useAppearanceStore((state) => state.appearance);
  const setAppearance = useAppearanceStore((state) => state.setAppearance);

  const [openSheet, setOpenSheet] = useState<SheetKind | null>(null);
  const closeSheet = useCallback(() => setOpenSheet(null), []);

  const { onExport, onImport, onDeleteAll } = useDataActions();

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Profile" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <IdentityBlock
          email={user?.email ?? null}
          name={user?.displayName ?? null}
          testID="profile-identity"
        />

        <SettingsSection icon="sliders" label="Training" testID="profile-training">
          <SettingsRow
            label="Units"
            onPress={() => setOpenSheet("units")}
            testID="profile-units"
            value={unit}
            variant="value"
          />
          <SettingsRow
            label="Week starts on"
            onPress={() => setOpenSheet("weekStart")}
            testID="profile-week-start"
            value={WEEK_START_LABELS[weekStart]}
            variant="value"
          />
          <SettingsRow
            label="RPE field"
            onToggleChange={setRpeEnabled}
            testID="profile-rpe"
            toggleValue={rpeEnabled}
            variant="toggle"
          />
          <SettingsRow
            label="Rest timer"
            onPress={() => setOpenSheet("rest")}
            testID="profile-rest"
            value={formatClock(restTimerSeconds)}
            variant="value"
          />
        </SettingsSection>

        <SettingsSection icon="database" label="Data" testID="profile-data">
          <SettingsRow label="Export data" onPress={onExport} testID="profile-export" variant="chevron" />
          <SettingsRow label="Import data" onPress={onImport} testID="profile-import" variant="chevron" />
          <SettingsRow
            label="Delete all workouts"
            onPress={onDeleteAll}
            testID="profile-delete"
            variant="destructive"
          />
        </SettingsSection>

        <SettingsSection icon="device" label="App" testID="profile-app">
          <SettingsRow
            label="Appearance"
            onPress={() => setOpenSheet("appearance")}
            testID="profile-appearance"
            value={APPEARANCE_LABELS[appearance]}
            variant="value"
          />
          <SettingsRow
            label="Notifications"
            onToggleChange={setNotificationsEnabled}
            testID="profile-notifications"
            toggleValue={notificationsEnabled}
            variant="toggle"
          />
          <SettingsRow
            label="About"
            testID="profile-about"
            value={APP_VERSION}
            variant="value"
          />
          <SettingsRow
            label="Acknowledgements"
            onPress={() => navigation.navigate("Acknowledgements")}
            testID="profile-acknowledgements"
            variant="chevron"
          />
          <SettingsRow
            label="Sign out"
            onPress={() => void signOut()}
            testID="profile-signout"
            variant="plain"
          />
        </SettingsSection>
      </ScrollView>

      <OptionSheet
        onClose={closeSheet}
        onSelect={setUnit}
        options={UNIT_OPTIONS}
        sectionLabel="Display as"
        selectedValue={unit}
        testID="profile-units-sheet"
        title="Units"
        visible={openSheet === "units"}
      />
      <OptionSheet
        onClose={closeSheet}
        onSelect={setWeekStart}
        options={WEEK_START_OPTIONS}
        sectionLabel="First day"
        selectedValue={weekStart}
        testID="profile-week-start-sheet"
        title="Week starts on"
        visible={openSheet === "weekStart"}
      />
      <OptionSheet
        onClose={closeSheet}
        onSelect={setRestTimerSeconds}
        options={REST_OPTIONS}
        sectionLabel="Duration"
        selectedValue={restTimerSeconds}
        testID="profile-rest-sheet"
        title="Rest timer"
        visible={openSheet === "rest"}
      />
      <OptionSheet
        onClose={closeSheet}
        onSelect={setAppearance}
        options={APPEARANCE_OPTIONS}
        sectionLabel="Theme"
        selectedValue={appearance}
        testID="profile-appearance-sheet"
        title="Appearance"
        visible={openSheet === "appearance"}
      />
    </SafeAreaView>
  );
}

const useStyles = createStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
}));
