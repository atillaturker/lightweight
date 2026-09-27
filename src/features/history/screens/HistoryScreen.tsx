/**
 * History tab root: past sessions grouped by month.
 *
 * Reads the durable local history store, offers an "All / PR only" filter,
 * and pushes to the read-only session detail. Month headers stick to the
 * top of the list. The whole screen is a read model — nothing here writes.
 */
import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { LineIcon } from "@components/LineIcon";
import { Pill } from "@components/Pill";
import type { Workout } from "@domain/entities";
import { colors, gutter, spacing, type } from "@theme";

import { MonthHeader, SessionRow } from "../components";
import {
  useHistoryFilterStore,
  useHistoryStore,
  type HistoryFilter,
} from "../store";
import {
  groupSessionsByMonth,
  sessionIdsWithPRs,
  type MonthSection,
} from "../utils";

import type { HistoryStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<HistoryStackParamList, "History">;

/** Diameter of the circular search button. */
const SEARCH_BUTTON_SIZE = 36;

/** Rendered edge length of the search glyph. */
const SEARCH_GLYPH_SIZE = 20;

/** Empty-state glyph, per v3 rule 6. */
const EMPTY_GLYPH_SIZE = 32;

/** No-op for the search affordance, which ships in a later batch. */
function noop(): void {
  return undefined;
}

/** 20px monoline magnifier. */
function SearchGlyph(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={SEARCH_GLYPH_SIZE}
      stroke={colors.textPrimary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={SEARCH_GLYPH_SIZE}
    >
      <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35" />
    </Svg>
  );
}

/** Left-aligned title with the circular search action on the right. */
function HistoryHeader({
  onSearch,
}: {
  onSearch: () => void;
}): React.ReactElement {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>History</Text>

      <Pressable
        accessibilityLabel="Search sessions"
        accessibilityRole="button"
        onPress={onSearch}
        style={styles.searchButton}
        testID="history-search"
      >
        <SearchGlyph />
      </Pressable>
    </View>
  );
}

/** Full-bleed, horizontally scrollable filter chips. */
function FilterRow({
  filter,
  onChange,
}: {
  filter: HistoryFilter;
  onChange: (filter: HistoryFilter) => void;
}): React.ReactElement {
  return (
    <ScrollView
      contentContainerStyle={styles.chipRow}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipScroll}
    >
      <Pill
        label="All workouts"
        onPress={() => onChange("all")}
        selected={filter === "all"}
        testID="history-filter-all"
      />
      <Pill
        label="PR only"
        onPress={() => onChange("pr")}
        selected={filter === "pr"}
        testID="history-filter-pr"
      />
    </ScrollView>
  );
}

/** Centered first-run state shown in place of the list and chips. */
function HistoryEmptyState(): React.ReactElement {
  return (
    <View style={styles.empty}>
      <LineIcon name="clock" size={EMPTY_GLYPH_SIZE} />
      <Text style={styles.emptyTitle}>No sessions yet</Text>
      <Text style={styles.emptyMessage}>
        Complete a workout to see it here.
      </Text>
    </View>
  );
}

/** Root screen of the History tab. */
export function HistoryScreen({ navigation }: Props): React.ReactElement {
  const sessions = useHistoryStore((state) => state.sessions);
  const filter = useHistoryFilterStore((state) => state.filter);
  const setFilter = useHistoryFilterStore((state) => state.setFilter);

  const now = Date.now();

  const visible = useMemo((): Workout[] => {
    if (filter === "all") return sessions;
    const prIds = sessionIdsWithPRs(sessions);
    return sessions.filter((session) => prIds.has(session.id));
  }, [filter, sessions]);

  const sections = useMemo(
    (): MonthSection[] => groupSessionsByMonth(visible),
    [visible],
  );

  const openSession = useCallback(
    (sessionId: string): void => {
      navigation.navigate("SessionDetail", { sessionId });
    },
    [navigation],
  );

  if (sessions.length === 0) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <HistoryHeader onSearch={noop} />
        <HistoryEmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <HistoryHeader onSearch={noop} />

      <SectionList<Workout, MonthSection>
        contentContainerStyle={styles.listContent}
        keyExtractor={(session) => session.id}
        ListEmptyComponent={
          <Text style={styles.filteredEmpty}>No sessions with a PR yet.</Text>
        }
        ListHeaderComponent={
          <FilterRow filter={filter} onChange={setFilter} />
        }
        renderItem={({ item, index }) => (
          <SessionRow
            dividerTop={index > 0}
            now={now}
            onPress={() => openSession(item.id)}
            session={item}
            testID={`history-session-${item.id}`}
          />
        )}
        renderSectionHeader={({ section }) => (
          <MonthHeader
            testID={`history-month-${section.key}`}
            title={section.title}
          />
        )}
        sections={sections}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  header: {
    height: 44,
    paddingHorizontal: gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.canvas,
  },
  headerTitle: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },
  searchButton: {
    width: SEARCH_BUTTON_SIZE,
    height: SEARCH_BUTTON_SIZE,
    borderRadius: SEARCH_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },

  chipScroll: {
    marginTop: spacing.lg,
  },
  chipRow: {
    paddingHorizontal: gutter,
    gap: spacing.sm,
  },

  listContent: {
    paddingBottom: spacing.xxl,
  },
  filteredEmpty: {
    ...type.bodySmall,
    paddingHorizontal: gutter,
    paddingTop: spacing.xxl,
    color: colors.textMuted,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.giant,
  },
  emptyTitle: {
    ...type.sectionTitle,
    marginTop: spacing.lg,
    color: colors.textPrimary,
  },
  emptyMessage: {
    ...type.body,
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
  },
});
