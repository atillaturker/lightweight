import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INITIAL_EXERCISES } from "../../data/exercises";
import {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "../../types/workout";

interface WorkoutState {
  activeWorkout: Workout | null;
  history: Workout[];
  routines: any[]; // define proper routine type later
  availableExercises: Exercise[];
}

const initialState: WorkoutState = {
  activeWorkout: null,
  history: [],
  routines: [],
  availableExercises: INITIAL_EXERCISES,
};

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<{ name?: string }>) => {
      if (state.activeWorkout) return; // Already active

      state.activeWorkout = {
        id: Date.now().toString(),
        name: action.payload.name || "Untitled Workout",
        startTime: new Date().toISOString(),
        exercises: [],
        status: "active",
      };
    },
    cancelWorkout: (state) => {
      state.activeWorkout = null;
    },
    finishWorkout: (state) => {
      if (state.activeWorkout) {
        const finishedWorkout: Workout = {
          ...state.activeWorkout,
          endTime: new Date().toISOString(),
          status: "completed",
          // Calculate duration here in a real app
        };
        state.history.unshift(finishedWorkout); // Add to top of history
        state.activeWorkout = null;
      }
    },
    addExerciseToWorkout: (
      state,
      action: PayloadAction<{ exercise: Exercise; instanceId?: string }>,
    ) => {
      if (!state.activeWorkout) return;

      const { exercise, instanceId } = action.payload;

      const newExercise: WorkoutExercise = {
        id: instanceId || Date.now().toString(), // Use provided ID or generate one
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        category: exercise.category,
        sets: [
          {
            id: Date.now().toString() + "_1",
            weight: "",
            reps: "",
            completed: false,
          }, // Initial empty set
        ],
      };

      state.activeWorkout.exercises.push(newExercise);
    },
    addSet: (state, action: PayloadAction<{ exerciseInstanceId: string }>) => {
      if (!state.activeWorkout) return;

      const exercise = state.activeWorkout.exercises.find(
        (e) => e.id === action.payload.exerciseInstanceId,
      );

      if (exercise) {
        // Copy previous set values if available
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: WorkoutSet = {
          id: Date.now().toString(),
          weight: lastSet ? lastSet.weight : "",
          reps: lastSet ? lastSet.reps : "",
          completed: false,
        };
        exercise.sets.push(newSet);
      }
    },
    removeSet: (
      state,
      action: PayloadAction<{ exerciseInstanceId: string; setId: string }>,
    ) => {
      if (!state.activeWorkout) return;

      const exercise = state.activeWorkout.exercises.find(
        (e) => e.id === action.payload.exerciseInstanceId,
      );

      if (exercise) {
        exercise.sets = exercise.sets.filter(
          (s) => s.id !== action.payload.setId,
        );
      }
    },
    updateSet: (
      state,
      action: PayloadAction<{
        exerciseInstanceId: string;
        setId: string;
        field: "weight" | "reps" | "completed";
        value: any;
      }>,
    ) => {
      if (!state.activeWorkout) return;

      const exercise = state.activeWorkout.exercises.find(
        (e) => e.id === action.payload.exerciseInstanceId,
      );

      if (exercise) {
        const set = exercise.sets.find((s) => s.id === action.payload.setId);
        if (set) {
          (set as any)[action.payload.field] = action.payload.value;
        }
      }
    },
    removeExercise: (state, action: PayloadAction<string>) => {
      if (!state.activeWorkout) return;
      state.activeWorkout.exercises = state.activeWorkout.exercises.filter(
        (e) => e.id !== action.payload,
      );
    },
  },
});

export const {
  startWorkout,
  cancelWorkout,
  finishWorkout,
  addExerciseToWorkout,
  addSet,
  removeSet,
  updateSet,
  removeExercise,
} = workoutSlice.actions;

export default workoutSlice.reducer;
