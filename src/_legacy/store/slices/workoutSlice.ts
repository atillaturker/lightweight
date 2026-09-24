import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INITIAL_EXERCISES } from "../../data/exercises";
import {
  fetchUserRoutinesFromFireStore,
  fetchUserWorkoutsFromFireStore,
  saveUserRoutineToFireStore,
  saveUserWorkoutToFireStore,
  updateUserRoutineInFireStore,
} from "../../services/firebase/workoutService";
import {
  Exercise,
  Routine,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "../../types/workout";
import { calculateWorkoutVolume } from "../../utils/workoutUtils";
import { RootState, WorkoutState } from "../index";

const initialState: WorkoutState = {
  activeWorkout: null,
  history: [],
  routines: [],
  availableExercises: INITIAL_EXERCISES,
  isLoading: false,
  error: null,
  draftRoutine: null,
};

export const fetchUserWorkouts = createAsyncThunk(
  "workout/fetchUserWorkout",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.uid;

    if (!userId) return rejectWithValue("UserId not found.");
    if (state.workout.activeWorkout?.routineId) {
    }
    const workoutHistory = await fetchUserWorkoutsFromFireStore(userId);
    return workoutHistory;
  },
);

export const fetchUserRoutines = createAsyncThunk(
  "workout/fetchUserRoutine",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.uid;

    if (!userId) return rejectWithValue("UserId not found.");
    const userRoutines = await fetchUserRoutinesFromFireStore(userId);
    return userRoutines;
  },
);

export const saveUserRoutine = createAsyncThunk(
  "workout/saveUserRoutine",
  async (routine: Routine, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.uid;

    if (!userId) return rejectWithValue("UserId not found.");
    await saveUserRoutineToFireStore(userId, routine);
    return routine;
  },
);

export const updateUserRoutine = createAsyncThunk(
  "workout/updateUserRoutine",
  async (routine: Routine, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.uid;

    if (!userId) return rejectWithValue("UserId not found.");
    await updateUserRoutineInFireStore(userId, routine);
    return routine;
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

    const activeWorkoutTotalVolume = calculateWorkoutVolume(
      activeWorkout.exercises,
    );

    const finishedWorkout: Workout = {
      ...activeWorkout,
      duration: duration,
      status: "completed",
      totalVolume: activeWorkoutTotalVolume,
    };

    await saveUserWorkoutToFireStore(userId, finishedWorkout);

    const updateRoutineAfterWorkout = (
      finishedWorkout: Workout,
      routines: Routine[],
      dispatch: any,
    ) => {
      if (!finishedWorkout.routineId) return;

      const existingRoutine = routines.find(
        (r) => r.id === finishedWorkout.routineId,
      );

      if (!existingRoutine) return;

      const updatedRoutine: Routine = {
        ...existingRoutine,
        lastPerformed: new Date().toISOString(),
        exercises: finishedWorkout.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => ({
            ...set,
            completed: false,
          })),
        })),
      };

      dispatch(updateUserRoutine(updatedRoutine));
    };

    updateRoutineAfterWorkout(
      finishedWorkout,
      state.workout.routines,
      dispatch,
    );
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
        totalVolume: 0,
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
    startWorkoutFromRoutine: (state, action: PayloadAction<Routine>) => {
      const routine = action.payload;
      const copiedExercises: WorkoutExercise[] = routine.exercises.map(
        (exercise) => ({
          ...exercise,
          id:
            Date.now().toString() +
            "_" +
            Math.random().toString(36).substr(2, 9),
          sets: exercise.sets.map((set, index) => ({
            ...set,
            id: Date.now().toString() + "_" + index,
            completed: false,
          })),
        }),
      );

      state.activeWorkout = {
        id: Date.now().toString(),
        routineId: routine.id,
        name: routine.name,
        date: new Date().toISOString(),
        exercises: copiedExercises,
        status: "active",
        totalVolume: calculateWorkoutVolume(copiedExercises),
      };
    },
    addOrUpdateRoutineLocal: (state, action: PayloadAction<Routine>) => {
      const index = state.routines.findIndex((r) => r.id === action.payload.id);
      if (index >= 0) {
        state.routines[index] = action.payload;
      } else {
        state.routines.push(action.payload);
      }
    },
    removeRoutineLocal: (state, action: PayloadAction<string>) => {
      state.routines = state.routines.filter((r) => r.id !== action.payload);
    },
    startRoutineDraft: (state, action: PayloadAction<{ name?: string }>) => {
      state.draftRoutine = {
        name: action.payload.name || "New Routine",
        exercises: [],
      };
    },
    cancelRoutineDraft: (state) => {
      state.draftRoutine = null;
    },
    updateRoutineDraftName: (state, action: PayloadAction<string>) => {
      if (state.draftRoutine) {
        state.draftRoutine.name = action.payload;
      }
    },
    addExerciseToRoutineDraft: (
      state,
      action: PayloadAction<{ exercise: Exercise; instanceId?: string }>,
    ) => {
      if (!state.draftRoutine || !state.draftRoutine.exercises) return;
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
      state.draftRoutine.exercises.push(newExercise);
    },
    removeExerciseFromRoutineDraft: (state, action: PayloadAction<string>) => {
      if (!state.draftRoutine || !state.draftRoutine.exercises) return;
      state.draftRoutine.exercises = state.draftRoutine.exercises.filter(
        (e) => e.id !== action.payload,
      );
    },
    addSetToRoutineDraft: (
      state,
      action: PayloadAction<{ exerciseInstanceId: string }>,
    ) => {
      if (!state.draftRoutine || !state.draftRoutine.exercises) return;
      const exercise = state.draftRoutine.exercises.find(
        (e) => e.id === action.payload.exerciseInstanceId,
      );
      if (exercise) {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        exercise.sets.push({
          id: Date.now().toString(),
          weight: lastSet ? lastSet.weight : "",
          reps: lastSet ? lastSet.reps : "",
          completed: false,
        });
      }
    },
    removeSetFromRoutineDraft: (
      state,
      action: PayloadAction<{ exerciseInstanceId: string; setId: string }>,
    ) => {
      if (!state.draftRoutine || !state.draftRoutine.exercises) return;
      const exercise = state.draftRoutine.exercises.find(
        (e) => e.id === action.payload.exerciseInstanceId,
      );
      if (exercise) {
        exercise.sets = exercise.sets.filter(
          (s) => s.id !== action.payload.setId,
        );
      }
    },
    updateSetInRoutineDraft: (
      state,
      action: PayloadAction<{
        exerciseInstanceId: string;
        setId: string;
        field: "weight" | "reps" | "completed";
        value: any;
      }>,
    ) => {
      if (!state.draftRoutine || !state.draftRoutine.exercises) return;
      const exercise = state.draftRoutine.exercises.find(
        (e) => e.id === action.payload.exerciseInstanceId,
      );
      if (exercise) {
        const set = exercise.sets.find((s) => s.id === action.payload.setId);
        if (set) {
          (set as any)[action.payload.field] = action.payload.value;
        }
      }
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
    builder.addCase(fetchUserRoutines.fulfilled, (state, action) => {
      state.routines = action.payload || [];
    });
    builder.addCase(saveUserRoutine.fulfilled, (state, action) => {
      if (action.payload) {
        state.routines.push(action.payload);
      }
    });
    builder.addCase(updateUserRoutine.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.routines.findIndex(
          (r) => r.id === action.payload?.id,
        );
        if (index >= 0) state.routines[index] = action.payload;
      }
    });
    builder.addCase(completeAndSyncUserWorkout.fulfilled, (state, action) => {
      state.activeWorkout = null;
      if (action.payload) {
        state.history.unshift(action.payload);
      }
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
  startWorkoutFromRoutine,
  addOrUpdateRoutineLocal,
  removeRoutineLocal,
  startRoutineDraft,
  cancelRoutineDraft,
  updateRoutineDraftName,
  addExerciseToRoutineDraft,
  removeExerciseFromRoutineDraft,
  addSetToRoutineDraft,
  removeSetFromRoutineDraft,
  updateSetInRoutineDraft,
} = workoutSlice.actions;

export default workoutSlice.reducer;
