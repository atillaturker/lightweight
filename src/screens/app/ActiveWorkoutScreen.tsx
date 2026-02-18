import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddExerciseButton } from "../../components/ui/AddExerciseButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Header } from "../../components/ui/Header";
import { StatsBar } from "../../components/ui/StatsBar";
import { ReadOnlyExerciseCard } from "../../components/workout/ReadOnlyExerciseCard";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  cancelWorkout,
  finishWorkout,
  removeExercise,
} from "../../store/slices/workoutSlice";
import { colors, spacing } from "../../theme";

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const ActiveWorkoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const dispatch = useAppDispatch();
  const activeWorkout = useAppSelector((state) => state.workout.activeWorkout);

  // Live timer
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeWorkout?.startTime) {
      const start = new Date(activeWorkout.startTime).getTime();
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeWorkout?.startTime]);

  const completedSets =
    activeWorkout?.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0,
    ) ?? 0;

  const totalSets =
    activeWorkout?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 0;

  const totalVolume =
    activeWorkout?.exercises.reduce((acc, ex) => {
      return (
        acc +
        ex.sets.reduce((setAcc, s) => {
          if (s.completed) {
            const w =
              typeof s.weight === "string"
                ? parseFloat(s.weight) || 0
                : s.weight;
            const r =
              typeof s.reps === "string" ? parseFloat(s.reps) || 0 : s.reps;
            return setAcc + w * r;
          }
          return setAcc;
        }, 0)
      );
    }, 0) ?? 0;

  const handleFinish = () => {
    Alert.alert(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          onPress: () => {
            dispatch(finishWorkout());
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to discard this workout?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            dispatch(cancelWorkout());
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (!activeWorkout) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title={activeWorkout.name}
        leftIcon="close"
        onLeftPress={handleCancel}
        rightText="FINISH"
        rightIcon="checkmark-done"
        onRightPress={handleFinish}
        timer={formatTime(elapsed)}
      />

      <StatsBar
        stats={[
          {
            label: "Exercises",
            value: activeWorkout.exercises.length,
            icon: "barbell-outline",
          },
          {
            label: "Sets",
            value: `${completedSets}/${totalSets}`,
            icon: "layers-outline",
          },
          {
            label: "kg Vol.",
            value: totalVolume > 0 ? `${totalVolume.toLocaleString()}` : "0",
            icon: "trending-up-outline",
          },
        ]}
      />

      {/* Exercise List */}
      <FlatList
        data={activeWorkout.exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReadOnlyExerciseCard
            exercise={item}
            onPress={() =>
              navigation.navigate(SCREENS.ACTIVE_EXERCISE_DETAIL, {
                exerciseInstanceId: item.id,
              })
            }
            onRemove={() => dispatch(removeExercise(item.id))}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Exercises Yet"
            subtitle="Tap the button below to add your first exercise"
            icon="barbell-outline"
          />
        }
        ListFooterComponent={
          <AddExerciseButton
            onPress={() => navigation.navigate(SCREENS.EXERCISE_SELECTOR)}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  timerText: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 10,
    gap: 4,
  },List
  listContent: {
    paddingBottom: 120,
    paddingTop: spacing.s,
  },
});
