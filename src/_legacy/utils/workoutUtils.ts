import { WorkoutExercise } from "../types/workout";

export const calculateExerciseVolume = (exercise: WorkoutExercise): number => {
  return exercise.sets.reduce((acc, s) => {
    if (s.completed) {
      const w =
        typeof s.weight === "string" ? parseFloat(s.weight) || 0 : s.weight;
      const r = typeof s.reps === "string" ? parseFloat(s.reps) || 0 : s.reps;
      return acc + w * r;
    }
    return acc;
  }, 0);
};

export const calculateWorkoutVolume = (
  exercises: WorkoutExercise[],
): number => {
  return exercises.reduce((acc, ex) => acc + calculateExerciseVolume(ex), 0);
};
