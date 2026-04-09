import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components/ui/Header";
import MyRoutinesSection from "../../components/workout/MyRoutinesSection";
import { QuickStartCard } from "../../components/workout/QuickStartCard";
import RecentActivitySection from "../../components/workout/RecentActivitySection";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchUserRoutines,
  fetchUserWorkouts,
  startWorkout,
  startWorkoutFromRoutine,
} from "../../store/slices/workoutSlice";
import { theme } from "../../theme";
import { Routine } from "../../types/workout";

export const WorkoutScreen = () => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const activeWorkout = useAppSelector((state) => state.workout.activeWorkout);
  const workoutHistory = useAppSelector((state) => state.workout.history);
  const userRoutines = useAppSelector((state) => state.workout.routines);
  const isLoading = useAppSelector((state) => state.workout.isLoading);

  const handleStartRoutine = useCallback(
    ({ item }: { item: Routine }) => {
      dispatch(startWorkoutFromRoutine(item));
      navigation.navigate(SCREENS.ACTIVE_WORKOUT);
    },
    [dispatch, navigation],
  );

  const handleStartEmptyWorkout = useCallback(() => {
    if (activeWorkout) {
      navigation.navigate(SCREENS.ACTIVE_WORKOUT);
    } else {
      dispatch(startWorkout({ name: "Freestyle Workout" }));
      navigation.navigate(SCREENS.ACTIVE_WORKOUT);
    }
  }, [dispatch, navigation, activeWorkout]);

  useEffect(() => {
    dispatch(fetchUserWorkouts());
    dispatch(fetchUserRoutines());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Workout" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <QuickStartCard
          onStartPress={handleStartEmptyWorkout}
          onResumePress={() => navigation.navigate(SCREENS.ACTIVE_WORKOUT)}
          activeWorkoutName={activeWorkout?.name}
          workoutStatus={activeWorkout?.status}
          style={styles.quickStartCard}
        />
        <MyRoutinesSection
          routines={userRoutines}
          onSeeAll={() => navigation.navigate(SCREENS.ROUTINES)}
          onStartRoutine={handleStartRoutine}
        />
        <RecentActivitySection history={workoutHistory} isLoading={isLoading} />
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
    paddingBottom: 100,
  },
  quickStartCard: {
    marginHorizontal: theme.spacing.l,
    marginVertical: theme.spacing.l,
  },
});
