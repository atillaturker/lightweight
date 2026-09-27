/**
 * Profile tab root: the signed-in identity plus training, data, and app
 * settings.
 *
 * Every setting writes straight to the persisted preferences store — there
 * is no primary CTA and no "Save". Units, week start, and rest timer each
 * open a single-select sheet; RPE and notifications are inline toggles.
 * The rest duration is read by the workout feature through its provider
 * seam, so changing it here changes the next set's rest timer.
 *
 * Export, import, and delete-all are placeholders for this batch: there is
 * no workout data source yet, so they do not move real data.
 */
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@components/ScreenHeader";
import { SettingsRow } from "@components/SettingsRow";
import type { WeekStart, WeightUnit } from "@domain/entities";
import { useAuthStore, useSignInActions } from "@features/auth";
import { formatClock } from "@lib/format";
import { colors, gutter, spacing } from "@theme";

import {
  IdentityBlock,
  OptionSheet,
  SettingsSection,
  type OptionSheetOption,
} from "../components";
import { APP_VERSION, REST_TIMER_SECONDS_OPTIONS } from "../config";
import { usePreferencesStore } from "../store";


/** Which preference sheet is open, if any. */
type SheetKind = "units" | "weekStart" | "rest";

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

/** Rest durations, labelled as `m:ss`. */
const REST_OPTIONS: readonly OptionSheetOption<number>[] =
  REST_TIMER_SECONDS_OPTIONS.map((value) => ({
    value,
    label: formatClock(value),
  }));

/** Root screen of the Profile tab. */
export function ProfileScreen(): React.ReactElement {
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

  const [openSheet, setOpenSheet] = useState<SheetKind | null>(null);
  const closeSheet = useCallback(() => setOpenSheet(null), []);

  const handleDeleteAll = useCallback((): void => {
    Alert.alert("Delete all workouts?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => undefined },
    ]);
  }, []);

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
          <SettingsRow label="Export data" testID="profile-export" variant="chevron" />
          <SettingsRow label="Import data" testID="profile-import" variant="chevron" />
          <SettingsRow
            label="Delete all workouts"
            onPress={handleDeleteAll}
            testID="profile-delete"
            variant="destructive"
          />
        </SettingsSection>

        <SettingsSection icon="device" label="App" testID="profile-app">
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
});
