/**
 * Edits the note on one exercise (seat height, grip, cues). Saving blank
 * text removes the note. The note belongs to the exercise, not the
 * session, so it shows every time the exercise is logged.
 */
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { EXERCISE_NOTE_MAX_LENGTH } from '@features/routines';
import { spacing, createStyles } from '@theme';

/** Props for {@link ExerciseNotePanel}. */
export interface ExerciseNotePanelProps {
  /** Current note, or `null` when there is none. */
  note: string | null;
  /** Called with the text to save; blank removes the note. */
  onSave: (text: string) => void;
}

/** Note field and its save action. */
export function ExerciseNotePanel({ note, onSave }: ExerciseNotePanelProps): React.ReactElement {
  const styles = useStyles();
  const [text, setText] = useState(note ?? '');
  return (
    <View style={styles.panel}>
      <Input
        autoFocus
        helperText="Shown each time you log this exercise."
        maxLength={EXERCISE_NOTE_MAX_LENGTH}
        onChangeText={setText}
        onSubmitEditing={() => onSave(text)}
        placeholder="Seat height, grip, cues…"
        returnKeyType="done"
        testID="exercise-note-input"
        value={text}
      />
      <View style={styles.action}>
        <Button
          fullWidth
          label={text.trim() === '' && note !== null ? 'Remove note' : 'Save note'}
          onPress={() => onSave(text)}
          testID="exercise-note-save"
        />
      </View>
    </View>
  );
}

const useStyles = createStyles(() => ({
  panel: {
    marginTop: spacing.lg,
  },
  action: {
    marginTop: spacing.lg,
  },
}));
