/**
 * The options sheet behind an exercise block's "⋯": the plate calculator
 * (barbell exercises only) and the exercise note. Choosing one swaps the
 * menu for that panel inside the same sheet, so there is never a sheet on
 * top of a sheet.
 *
 * Follows the shared sheet pattern (slide-up canvas panel, top hairline,
 * backdrop) used by the routine action sheet.
 */
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExerciseNote, useExerciseNoteStore } from '@features/routines';
import { fineSpacing, gutter, radii, spacing, type, createStyles } from '@theme';

import { getExerciseLibrary, getWeightUnit } from '../services';
import type { ActiveExercise } from '../types';
import { initialPlateTarget } from '../utils/plateTarget';

import { ExerciseNotePanel } from './ExerciseNotePanel';
import { PlateCalculatorPanel } from './PlateCalculatorPanel';

type Mode = 'menu' | 'plates' | 'note';

/** Props for {@link ExerciseToolsSheet}. */
export interface ExerciseToolsSheetProps {
  /** Exercise the tools apply to, or `null` while closed. */
  exercise: ActiveExercise | null;
  onClose: () => void;
}

/** One tappable row of the menu. */
function MenuRow({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }): React.ReactElement {
  const styles = useStyles();
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.row} testID={testID}>
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}

/** Sheet content for an open exercise; remounted per exercise. */
function ToolsContent({ exercise, onClose }: { exercise: ActiveExercise; onClose: () => void }): React.ReactElement {
  const styles = useStyles();
  const [mode, setMode] = useState<Mode>('menu');
  const note = useExerciseNote(exercise.exerciseId);
  const setNote = useExerciseNoteStore((state) => state.setNote);
  const isBarbell = getExerciseLibrary().some(
    (entry) => entry.id === exercise.exerciseId && entry.equipment === 'barbell',
  );
  const title = mode === 'plates' ? 'Plate calculator' : mode === 'note' ? 'Note' : exercise.name;

  return (
    <>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      {mode === 'menu' ? null : <Text style={styles.subtitle}>{exercise.name}</Text>}

      {mode === 'plates' ? (
        <PlateCalculatorPanel initialTarget={initialPlateTarget(exercise, getWeightUnit())} unit={getWeightUnit()} />
      ) : null}
      {mode === 'note' ? (
        <ExerciseNotePanel
          note={note}
          onSave={(text) => {
            setNote(exercise.exerciseId, text);
            onClose();
          }}
        />
      ) : null}
      {mode === 'menu' ? (
        <View style={styles.menu}>
          {isBarbell ? (
            <MenuRow label="Plate calculator" onPress={() => setMode('plates')} testID="exercise-tools-plates" />
          ) : null}
          <MenuRow
            label={note === null ? 'Add note' : 'Edit note'}
            onPress={() => setMode('note')}
            testID="exercise-tools-note"
          />
        </View>
      ) : null}

      <View style={styles.divider} />
      <MenuRow label={mode === 'menu' ? 'Cancel' : 'Close'} onPress={onClose} testID="exercise-tools-close" />
    </>
  );
}

/** Exercise options sheet. */
export function ExerciseToolsSheet({ exercise, onClose }: ExerciseToolsSheetProps): React.ReactElement {
  const styles = useStyles();
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={exercise !== null}>
      <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.avoider}>
        <SafeAreaView edges={['bottom']} style={styles.sheet} testID="exercise-tools-sheet">
          <View style={styles.hairline} />
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {exercise === null ? null : (
              <ToolsContent exercise={exercise} key={exercise.exerciseId} onClose={onClose} />
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = createStyles((colors) => ({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },
  avoider: {
    marginTop: 'auto',
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radii.stage,
    borderTopRightRadius: radii.stage,
  },
  hairline: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  content: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  title: {
    ...type.sectionTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },
  menu: {
    marginTop: spacing.lg,
  },
  row: {
    justifyContent: 'center',
    minHeight: 52,
  },
  rowLabel: {
    ...type.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    marginTop: spacing.sm,
    backgroundColor: colors.hairline,
  },
}));
