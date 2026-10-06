/**
 * Public surface of the routines feature. Other features import from
 * here, never from a path inside the feature.
 */
export type { RoutineTemplateId } from './types';

export {
  EXERCISE_NOTE_MAX_LENGTH,
  ROUTINES_STORE_KEY,
  useCustomExerciseStore,
  useExerciseNote,
  useExerciseNoteStore,
  useRoutineStore,
} from './store';
export { useSetCustomExerciseArchived } from './hooks';
export type { RoutineStore } from './store';

export {
  calculatedRoutineMinutes,
  routineDurationMinutes,
  routineMeta,
  supersetLabels,
} from './utils';

export { EXERCISE_LIBRARY, TEMPLATE_EXERCISE_IDS } from './services';

export { RoutineActionSheet } from './components/RoutineActionSheet';
export type { RoutineActionSheetProps } from './components/RoutineActionSheet';
export { RoutineRow } from './components/RoutineRow';
export { ExerciseTechnique } from './components/ExerciseTechnique';
export { ExerciseThumb } from './components/ExerciseThumb';
export type { ExerciseTechniqueProps } from './components/ExerciseTechnique';
export type { RoutineRowProps } from './components/RoutineRow';

export {
  CustomExerciseScreen,
  ExercisePickerScreen,
  RoutineEditorScreen,
  RoutinesScreen,
} from './screens';
