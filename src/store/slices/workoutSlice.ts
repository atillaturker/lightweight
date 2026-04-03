import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INITIAL_EXERCISES } from "../../data/exercises";
import {
  fetchUserWorkoutsFromFireStore,
  saveUserWorkoutToFireStore,
} from "../../services/firebase/workoutService";
import {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "../../types/workout";
import { RootState, WorkoutState } from "../index";

const initialState: WorkoutState = {
  activeWorkout: null,
  history: [],
  routines: [],
  availableExercises: INITIAL_EXERCISES,
  isLoading: false,
  error: null,
};

export const fetchUserWorkouts = createAsyncThunk(
  "workout/fetchUserWorkout",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.uid;

    if (!userId) return rejectWithValue("UserId not found.");
    const workoutHistory = await fetchUserWorkoutsFromFireStore(userId);
    return workoutHistory;
  },
);

export const completeAndSyncUserWorkout = createAsyncThunk(
  "workout/completeUserWorkout",
  async (
    duration: number | undefined,
    { getState, rejectWithValue, dispatch },
  ) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.uid;
    const activeWorkout = state.workout.activeWorkout;

    if (!userId) return rejectWithValue("Error! UserID not found.");
    if (!activeWorkout)
      return rejectWithValue("Error! Active Workout not found.");

    const finishedWorkout: Workout = {
      ...activeWorkout,
      duration: duration,
      status: "completed",
    };
    await saveUserWorkoutToFireStore(userId, finishedWorkout);

    dispatch(finishWorkoutSuccess(finishedWorkout));
    return finishedWorkout;
  },
);

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<{ name?: string }>) => {
      if (state.activeWorkout) return;

      state.activeWorkout = {
        id: Date.now().toString(),
        name: action.payload.name || "Untitled Workout",
        date: new Date().toISOString(),
        exercises: [],
        status: "active",
      };
    },
    cancelWorkout: (state) => {
      state.activeWorkout = null;
    },
    finishWorkoutSuccess: (state, action: PayloadAction<Workout>) => {
      state.history.unshift(action.payload);
      state.activeWorkout = null;
    },
    addExerciseToWorkout: (
      state,
      action: PayloadAction<{ exercise: Exercise; instanceId?: string }>,
    ) => {
      if (!state.activeWorkout) return;

      const { exercise, instanceId } = action.payload;

      const newExercise: WorkoutExercise = {
        id: instanceId || Date.now().toString(),
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
          },
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
  extraReducers: (builder) => {
    builder.addCase(fetchUserWorkouts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserWorkouts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.history = action.payload;
    });
    builder.addCase(fetchUserWorkouts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  startWorkout,
  cancelWorkout,
  finishWorkoutSuccess,
  addExerciseToWorkout,
  addSet,
  removeSet,
  updateSet,
  removeExercise,
} = workoutSlice.actions;

export default workoutSlice.reducer;
