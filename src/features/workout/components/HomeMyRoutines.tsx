/**
 * Home — "My Routines" section.
 *
 * A short, read-only preview of the user's routines, placed between the
 * next-session block and the weekly strip so routines are discoverable
 * without leaving Home. Rows reuse the Routines screen's row structure, so
 * the same name/meta/marker/overflow vocabulary appears in both places.
 *
 * The section header is always rendered — even with no routines — so users
 * always know where routines live. When there are none, the section shows a
 * two-line empty state. It optionally offers a "Create routine" action, which
 * the screen suppresses when the next-session block already shows the same
 * CTA, so a screen never carries two primary create actions.
 *
 * At most three routines are shown; when more exist the header carries a
 * "See all" action that opens the full list. The rows are one short list
 * group, so they sit in a single Card (v3 rule 1).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@components/Card";
import { SectionHeader } from "@components/SectionHeader";
import type { Routine } from "@domain/entities";
import { RoutineRow, routineDurationMinutes } from "@features/routines";
import { colors, spacing, type } from "@theme";

/** Maximum routines previewed on Home before "See all" takes over. */
export const HOME_ROUTINE_PREVIEW_LIMIT = 3;

/** Props for {@link HomeMyRoutines}. */
export interface HomeMyRoutinesProps {
  routines: Routine[];
  /** Id of the active routine, marked with the accent dot. */
  activeRoutineId: string | null;
  /** Called when a row body is pressed. */
  onSelectRoutine: (routineId: string) => void;
  /** Called when a row's "⋯" is pressed. */
  onPressMore: (routine: Routine) => void;
  /** Called when the "See all" action is pressed. */
  onPressSeeAll: () => void;
  /** Called when the empty state's "Create routine" action is pressed. */
  onCreateRoutine: () => void;
  /**
   * Whether the empty state may offer its own "Create routine" action.
   * Set false when another block on the screen already offers the same
   * call to action.
   */
  showCreateAction: boolean;
  testID?: string;
}

/** Two-line empty state shown when the user has no routines. */
function EmptyRoutines({
  onCreateRoutine,
  showCreateAction,
  testID,
}: {
  onCreateRoutine: () => void;
  showCreateAction: boolean;
  testID?: string;
}): React.ReactElement {
  return (
    <View style={styles.empty} testID={testID}>
      <Text style={styles.emptyTitle}>No routines yet</Text>
      <Text style={styles.emptyMessage}>
        Create one to start tracking your lifts.
      </Text>

      {showCreateAction ? (
        <Pressable
          accessibilityLabel="Create routine"
          accessibilityRole="button"
          onPress={onCreateRoutine}
          style={styles.createAction}
          testID={testID ? `${testID}-create` : undefined}
        >
          <Text style={styles.createLabel}>Create routine</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Home section previewing the user's routines. */
export function HomeMyRoutines({
  routines,
  activeRoutineId,
  onSelectRoutine,
  onPressMore,
  onPressSeeAll,
  onCreateRoutine,
  showCreateAction,
  testID,
}: HomeMyRoutinesProps): React.ReactElement {
  const shown = routines.slice(0, HOME_ROUTINE_PREVIEW_LIMIT);
  const showSeeAll = routines.length > HOME_ROUTINE_PREVIEW_LIMIT;

  const seeAll = (
    <Pressable
      accessibilityLabel="See all routines"
      accessibilityRole="button"
      onPress={onPressSeeAll}
      style={styles.seeAll}
      testID={testID ? `${testID}-see-all` : undefined}
    >
      <Text style={styles.seeAllLabel}>See all</Text>
    </Pressable>
  );

  return (
    <View testID={testID}>
      <View style={styles.header}>
        <SectionHeader
          action={showSeeAll ? seeAll : undefined}
          icon="list"
          label="My Routines"
          testID={testID ? `${testID}-header` : undefined}
        />
      </View>

      {routines.length === 0 ? (
        <EmptyRoutines
          onCreateRoutine={onCreateRoutine}
          showCreateAction={showCreateAction}
          testID={testID ? `${testID}-empty` : undefined}
        />
      ) : (
        <View style={styles.list}>
          <Card testID={testID ? `${testID}-card` : undefined}>
            {shown.map((routine, index) => (
              <View key={routine.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <RoutineRow
                  isActive={routine.id === activeRoutineId}
                  meta={`${routine.exercises.length} exercises · ~${routineDurationMinutes(routine)} min`}
                  name={routine.name}
                  onPress={() => onSelectRoutine(routine.id)}
                  onPressMore={() => onPressMore(routine)}
                  testID={`home-routine-row-${routine.id}`}
                  variant="inset"
                />
              </View>
            ))}
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
  },
  seeAll: {
    height: 44,
    justifyContent: "center",
  },
  seeAllLabel: {
    ...type.label,
    color: colors.textMuted,
  },

  empty: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  emptyTitle: {
    ...type.body,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  /** 4px below the title. */
  emptyMessage: {
    ...type.body,
    fontSize: 14,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  /** 16px below the message, with a 44px tap target. */
  createAction: {
    justifyContent: "center",
    minHeight: 44,
    marginTop: spacing.lg,
    alignSelf: "flex-start",
  },
  createLabel: {
    ...type.body,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },

  list: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
});
