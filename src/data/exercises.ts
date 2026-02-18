import { Exercise } from "../types/workout";

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: "bench_press",
    name: "Bench Press (Barbell)",
    muscleGroup: "chest",
    category: "Barbell",
  },
  {
    id: "squat",
    name: "Squat (Barbell)",
    muscleGroup: "legs",
    category: "Barbell",
  },
  {
    id: "deadlift",
    name: "Deadlift (Barbell)",
    muscleGroup: "back",
    category: "Barbell",
  },
  {
    id: "pull_up",
    name: "Pull Up",
    muscleGroup: "back",
    category: "Bodyweight",
  },
  {
    id: "shoulder_press",
    name: "Overhead Press (Dumbbell)",
    muscleGroup: "shoulders",
    category: "Dumbbell",
  },
  {
    id: "dumbbell_row",
    name: "Dumbbell Row",
    muscleGroup: "back",
    category: "Dumbbell",
  },
  {
    id: "bicep_curl",
    name: "Bicep Curl (Dumbbell)",
    muscleGroup: "biceps",
    category: "Dumbbell",
  },
  {
    id: "tricep_extension",
    name: "Tricep Extension (Cable)",
    muscleGroup: "triceps",
    category: "Cable",
  },
  {
    id: "leg_press",
    name: "Leg Press",
    muscleGroup: "legs",
    category: "Machine",
  },
  { id: "crunch", name: "Crunch", muscleGroup: "abs", category: "Bodyweight" },
];
