import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoutineCard } from "../../components/workout/RoutineCard";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchUserRoutines,
  fetchUserWorkouts,
  startRoutineDraft,
  startWorkoutFromRoutine,
} from "../../store/slices/workoutSlice";
import { theme } from "../../theme";
import { Routine } from "../../types/workout";

// Mock Data for Routines matching the image
const MOCK_ROUTINES = [
  {
    id: "1",
    title: "Push Day A",
    tags: ["chest", "triceps"],
    exercisesCount: 8,
    duration: "65 Mins",
  },
  {
    id: "2",
    title: "Pull Strength",
    tags: ["back", "biceps"],
    exercisesCount: 6,
    duration: "50 Mins",
  },
  {
    id: "3",
    title: "Legs & Core",
    tags: ["quads", "abs"],
    exercisesCount: 10,
    duration: "75 Mins",
  },
];

export const RoutinesScreen = () => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const activeWorkout = useAppSelector((state) => state.workout.activeWorkout);
  const WorkoutHistory = useAppSelector((state) => state.workout.history);
  const userRoutines = useAppSelector((state) => state.workout.routines);

  useEffect(() => {
    dispatch(fetchUserWorkouts());
    dispatch(fetchUserRoutines());
  }, [dispatch]);

  const handleStartRoutine = (routine: Routine) => {
    dispatch(startWorkoutFromRoutine(routine));
    navigation.navigate(SCREENS.ACTIVE_WORKOUT);
  };

  const handleCreateRoutine = () => {
    dispatch(startRoutineDraft({ name: "" }));
    navigation.navigate(SCREENS.CREATE_ROUTINE);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MY ROUTINES</Text>
          <Text style={styles.headerSubtitle}>
            Choose your focus for today's session.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Routines List (Vertical instead of Horizontal based on image) */}
        <View style={styles.routinesList}>
          {userRoutines &&
            userRoutines.map((routine, index) => {
              const tags = Array.from(
                new Set(routine.exercises.map((e) => e.muscleGroup)),
              );
              return (
                <RoutineCard
                  key={routine.id}
                  title={routine.name}
                  tags={tags}
                  exercisesCount={routine.exercises?.length || 0}
                  duration="—"
                  isActive={index === 0}
                  onStartPress={() => handleStartRoutine(routine)}
                />
              );
            })}
        </View>
        {/* Create New Routine Button */}
        <TouchableOpacity
          style={styles.createRoutineCard}
          onPress={handleCreateRoutine}
          activeOpacity={0.7}
        >
          <View style={styles.createIconContainer}>
            <Ionicons
              name="add"
              size={24}
              color={theme.colors.text.secondary}
            />
          </View>
          <Text style={styles.createRoutineTitle}>Create New Routine</Text>
          <Text style={styles.createRoutineSubtitle}>
            Build a custom workout plan that fits your goals.
          </Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="history"
              size={20}
              color={theme.colors.brand.primary}
              style={styles.statBoxIcon}
            />
            <Text style={styles.statBoxLabel}>LAST SESSION</Text>
            <Text style={styles.statBoxValue}>2 Days ago</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="trending-up"
              size={20}
              color={theme.colors.brand.primary}
              style={styles.statBoxIcon}
            />
            <Text style={styles.statBoxLabel}>THIS WEEK</Text>
            <Text style={styles.statBoxValue}>3 Sessions</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.l,
    paddingBottom: 100, // Extra padding for bottom tab bar or FAB
  },
  header: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: "900", // very bold like image
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.s,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.text.secondary,
  },
  routinesList: {
    marginBottom: theme.spacing.l,
  },
  createRoutineCard: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.round,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.l,
  },
  createRoutineTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.l,
    fontWeight: "700",
    fontFamily: theme.typography.fonts.primary,
    marginBottom: theme.spacing.xs,
  },
  createRoutineSubtitle: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.s,
    fontFamily: theme.typography.fonts.primary,
    textAlign: "center",
    paddingHorizontal: theme.spacing.l,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.m,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary, // subtle dark background
    borderRadius: theme.radii.l,
    padding: theme.spacing.l,
  },
  statBoxIcon: {
    marginBottom: theme.spacing.s,
  },
  statBoxLabel: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.xxs,
    fontFamily: theme.typography.fonts.primary,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statBoxValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.m,
    fontFamily: theme.typography.fonts.primary,
    fontWeight: "700",
  },
});
