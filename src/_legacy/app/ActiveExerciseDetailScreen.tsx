import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components/ui/Header";
import { StatsBar } from "../../components/ui/StatsBar";
import { ActiveExerciseCard } from "../../components/workout/ActiveExerciseCard";
import { ExerciseInfoCard } from "../../components/workout/ExerciseInfoCard";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addSet,
  removeExercise,
  removeSet,
  updateSet,
} from "../../store/slices/workoutSlice";
import { theme } from "../../theme";
import { WorkoutExercise } from "../../types/workout";
import { calculateExerciseVolume } from "../../utils/workoutUtils";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type RouteProps = RouteProp<
  AppStackParamList,
  typeof SCREENS.ACTIVE_EXERCISE_DETAIL
>;

export const ActiveExerciseDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const dispatch = useAppDispatch();
  const { exerciseInstanceId } = route.params;

  const exercise = useAppSelector((state) =>
    state.workout.activeWorkout?.exercises.find(
      (e) => e.id === exerciseInstanceId,
    ),
  );

  useEffect(() => {
    if (!exercise) {
      navigation.goBack();
    }
  }, [exercise, navigation]);

  const handleSave = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise from your workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            dispatch(removeExercise(exerciseInstanceId));
            navigation.goBack();
          },
        },
      ],
    );
  }, [dispatch, exerciseInstanceId, navigation]);

  const handleAddSet = useCallback(() => {
    dispatch(addSet({ exerciseInstanceId }));
  }, [dispatch, exerciseInstanceId]);

  const handleRemoveSet = useCallback(
    (setId: string) => {
      dispatch(removeSet({ exerciseInstanceId, setId }));
    },
    [dispatch, exerciseInstanceId],
  );

  const handleUpdateSet = useCallback(
    (
      setId: string,
      field: "weight" | "reps" | "completed",
      value: string | boolean | number,
    ) => {
      dispatch(updateSet({ exerciseInstanceId, setId, field, value }));
    },
    [dispatch, exerciseInstanceId],
  );

  const stats = useMemo(() => {
    if (!exercise) return [];

    const completedSets = exercise.sets.filter((s) => s.completed).length;
    const totalSets = exercise.sets.length;
    const totalVolume = exercise.sets.reduce((acc, s) => {
      if (s.completed) {
        const w =
          typeof s.weight === "string" ? parseFloat(s.weight) || 0 : s.weight;
        const r = typeof s.reps === "string" ? parseFloat(s.reps) || 0 : s.reps;
        return acc + w * r;
      }
      return acc;
    }, 0);
    const totalVolume2 = calculateExerciseVolume(exercise as WorkoutExercise);

    return [
      {
        label: "Total Sets",
        value: totalSets,
        icon: "layers-outline" as const,
      },
      {
        label: "Completed",
        value: `${completedSets}/${totalSets}`,
        icon: "checkmark-circle-outline" as const,
      },
      {
        label: "Volume",
        value: totalVolume2 > 0 ? `${totalVolume2}kg` : "0kg",
        icon: "barbell-outline" as const,
      },
    ];
  }, [exercise]);

  if (!exercise) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="Edit Exercise"
        onLeftPress={() => navigation.goBack()}
        leftIcon="chevron-back"
        rightText="SAVE"
        onRightPress={handleSave}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseInfoCard
          name={exercise.name}
          category={exercise.category}
          muscleGroup={exercise.muscleGroup}
          onDelete={handleDelete}
        />

        <StatsBar stats={stats} style={{ marginHorizontal: 0 }} />

        <View style={styles.cardContainer}>
          <ActiveExerciseCard
            exercise={exercise}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onUpdateSet={handleUpdateSet}
            onRemoveExercise={handleDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    padding: theme.spacing.l,
    paddingBottom: 120,
  },
  cardContainer: {
    marginTop: theme.spacing.m,
  },
});
