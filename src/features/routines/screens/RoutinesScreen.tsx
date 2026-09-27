/**
 * Routines list — every saved routine, with the active one marked.
 *
 * Read-only plus row-level management: tapping a row opens the editor and
 * the "⋯" opens the action sheet (set as active / edit / delete). Long-press
 * is deliberately absent so the same interaction works on Home's preview.
 *
 * The active routine is marked with a 6px accent dot, per the feature
 * design — never a badge or pill, and only one row can carry it.
 */
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { ScreenHeader } from "@components/ScreenHeader";
import type { Routine } from "@domain/entities";
import { colors, emptyStatePadding, gutter, spacing, type } from "@theme";

import { RoutineActionSheet } from "../components/RoutineActionSheet";
import { RoutineRow } from "../components/RoutineRow";
import { useRoutineStore } from "../store";
import { routineDurationMinutes } from "../utils";

import type { TodayStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<TodayStackParamList, "Routines">;

/** Routines list, owned by the Today stack since routines live on Home. */
export function RoutinesScreen({ navigation }: Props): React.ReactElement {
  const routines = useRoutineStore((state) => state.routines);
  const activeRoutineId = useRoutineStore((state) => state.activeRoutineId);
  const setActiveRoutine = useRoutineStore((state) => state.setActiveRoutine);
  const deleteRoutine = useRoutineStore((state) => state.deleteRoutine);

  const [actionRoutine, setActionRoutine] = useState<Routine | null>(null);

  const isEmpty = routines.length === 0;

  const openEditor = useCallback(
    (routineId?: string): void => {
      navigation.navigate("RoutineEditor", routineId ? { routineId } : {});
    },
    [navigation],
  );

  const handleSetActive = useCallback(
    (routineId: string): void => setActiveRoutine(routineId),
    [setActiveRoutine],
  );

  const handleDelete = useCallback(
    (routineId: string): void => deleteRoutine(routineId),
    [deleteRoutine],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        showBack
        onBack={navigation.goBack}
        title="Routines"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptyMessage}>
              Create your first routine to start tracking.
            </Text>
          </View>
        ) : (
          routines.map((routine, index) => (
            <View key={routine.id}>
              {index > 0 ? <View style={styles.rowHairline} /> : null}
              <RoutineRow
                isActive={routine.id === activeRoutineId}
                meta={`${routine.exercises.length} exercises · ~${routineDurationMinutes(routine)} min`}
                name={routine.name}
                onPress={() => openEditor(routine.id)}
                onPressMore={() => setActionRoutine(routine)}
                testID={`routine-row-${routine.id}`}
              />
            </View>
          ))
        )}
      </ScrollView>

      {!isEmpty ? (
        <View style={styles.footer}>
          <Button
            fullWidth
            label="New routine"
            onPress={() => openEditor()}
            testID="routines-new"
          />
        </View>
      ) : null}

      <RoutineActionSheet
        isActive={actionRoutine?.id === activeRoutineId}
        onClose={() => setActionRoutine(null)}
        onDelete={handleDelete}
        onEdit={openEditor}
        onSetActive={handleSetActive}
        routine={actionRoutine}
        visible={actionRoutine !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  content: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },

  rowHairline: {
    height: 1,
    marginHorizontal: gutter,
    backgroundColor: colors.hairline,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: emptyStatePadding,
  },
  emptyTitle: {
    ...type.sectionTitle,
    textAlign: "center",
    color: colors.textPrimary,
  },
  emptyMessage: {
    ...type.bodySmall,
    marginTop: spacing.sm,
    fontSize: 14,
    textAlign: "center",
    color: colors.textMuted,
  },

  footer: {
    paddingHorizontal: gutter,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
});
