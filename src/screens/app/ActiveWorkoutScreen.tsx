import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddExerciseButton } from "../../components/ui/AddExerciseButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Header } from "../../components/ui/Header";
import ModalComponent from "../../components/ui/Modal";
import { StatsBar } from "../../components/ui/StatsBar";
import TimeSelector from "../../components/ui/TimeSelector";
import { ReadOnlyExerciseCard } from "../../components/workout/ReadOnlyExerciseCard";
import WorkoutDurationFooter from "../../components/workout/WorkoutDurationFooter";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  cancelWorkout,
  completeAndSyncUserWorkout,
  removeExercise,
} from "../../store/slices/workoutSlice";
import { theme } from "../../theme";
import { calculateWorkoutVolume } from "../../utils/workoutUtils";

// --- Time Data ---
const HOURS = Array.from({ length: 13 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... 55

export const ActiveWorkoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const dispatch = useAppDispatch();
  const activeWorkout = useAppSelector((state) => state.workout.activeWorkout);

  // Initialize with 1 hour 0 minutes (or 00:00)
  // We use a fixed date and only care about time part

  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  const completedSets =
    activeWorkout?.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0,
    ) ?? 0;

  const totalSets =
    activeWorkout?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 0;

  const totalVolume = calculateWorkoutVolume(activeWorkout?.exercises ?? []);

  const handleFinishPress = () => {
    setShowFinishModal(true);
  };

  const confirmFinish = () => {
    // Convert to seconds
    const totalSeconds = selectedHour * 3600 + selectedMinute * 60;

    dispatch(completeAndSyncUserWorkout(totalSeconds));
    setShowFinishModal(false);
    navigation.goBack();
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
        onRightPress={handleFinishPress}
      />
      <ModalComponent
        visible={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="Workout Duration"
        footer={
          <>
            <WorkoutDurationFooter
              onBack={() => setShowFinishModal(false)}
              onComplete={confirmFinish}
            />
          </>
        }
      >
        <View style={styles.modalContent}>
          <View style={styles.pickersRow}>
            <TimeSelector
              label="Hours"
              data={HOURS}
              selected={selectedHour}
              onSelect={setSelectedHour}
            />
            <Text style={styles.separator}>:</Text>
            <TimeSelector
              label="Minutes"
              data={MINUTES}
              selected={selectedMinute}
              onSelect={setSelectedMinute}
            />
          </View>

          {/* Selected Duration Display */}
          <View style={styles.selectedDurationRow}>
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.colors.brand.primary}
            />
            <Text style={styles.selectedDurationText}>
              {selectedHour}h {selectedMinute.toString().padStart(2, "0")}m
            </Text>
          </View>
        </View>
      </ModalComponent>
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
    backgroundColor: theme.colors.background.primary,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {},
  modalHeader: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "bold",
    margin: 20,
    color: theme.colors.text.primary,
    borderWidth: 1,
  },
  pickersRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 200,
    marginBottom: 5,
    borderColor: theme.colors.ui.border,
    borderRadius: theme.radii.l,
    padding: theme.spacing.m,
  },
  selectorContainer: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },

  separator: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: "bold",
    marginHorizontal: 10,
    marginTop: 20,
    color: theme.colors.text.primary,
  },
  timeOption: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeOptionSelected: {
    backgroundColor: theme.colors.background.tertiary,
  },
  timeText: {
    fontSize: theme.typography.sizes.l,
    color: theme.colors.text.secondary,
  },
  timeTextSelected: {
    fontWeight: "bold",
    color: theme.colors.brand.primary,
  },
  selectedDurationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    marginTop: theme.spacing.s,
  },
  selectedDurationText: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.brand.primary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  timerText: {
    color: theme.colors.brand.primary,
    fontSize: theme.typography.sizes.s,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.primary,
    borderBottomColor: theme.colors.ui.border,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.m,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: theme.spacing.s,
  },
});
