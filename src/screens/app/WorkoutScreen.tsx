import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { ActivityRow } from "../../components/workout/ActivityRow";
import { QuickStartCard } from "../../components/workout/QuickStartCard";
import { RoutineCard } from "../../components/workout/RoutineCard";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchUserWorkouts,
  startWorkout,
} from "../../store/slices/workoutSlice";
import { colors, spacing } from "../../theme";

// Mock Data for Routines (Placeholder for now)
const MOCK_ROUTINES = [
  {
    id: "1",
    title: "Push Heavy",
    lastPerformed: "3 days ago",
    exercisesCount: 6,
    duration: "~55m",
  },
  {
    id: "2",
    title: "Leg Day",
    lastPerformed: "1 week ago",
    exercisesCount: 5,
    duration: "~45m",
  },
  {
    id: "3",
    title: "Full Body Circuit",
    lastPerformed: "2 weeks ago",
    exercisesCount: 8,
    duration: "~60m",
  },
];

export const WorkoutScreen = () => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const activeWorkout = useAppSelector((state) => state.workout.activeWorkout);
  // Get WorkoutHistory from Redux
  const WorkoutHistory = useAppSelector((state) => state.workout.history);

  useEffect(() => {
    // Component yüklendiğinde Firestore'dan history verisini çek
    dispatch(fetchUserWorkouts());
  }, [dispatch]);

  const handleQuickStart = () => {
    dispatch(startWorkout({ name: "Workout" }));
    navigation.navigate(SCREENS.ACTIVE_WORKOUT);
  };

  const handleResume = () => {
    navigation.navigate(SCREENS.ACTIVE_WORKOUT);
  };

  // Helper to format date for ActivityRow
  const formatActivityDate = (isoString?: string) => {
    if (!isoString) return { day: "UNK", dayNum: "00" };
    const date = new Date(isoString);
    const day = date
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    const dayNum = date.getDate().toString();
    return { day, dayNum };
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WORKOUT</Text>
        <TouchableOpacity>
          <Ionicons
            name="settings-sharp"
            size={24}
            color={colors.text.tertiary}
            onPress={() => {
              console.log("Settings tab pressed.");
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Start */}
        <QuickStartCard
          onStartPress={handleQuickStart}
          activeWorkoutName={activeWorkout?.name}
          onResumePress={handleResume}
        />

        {/* Routines Section */}
        <SectionHeader title="MY ROUTINES" actionText="SEE ALL" />
        <FlatList
          data={MOCK_ROUTINES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoutineCard
              title={item.title}
              lastPerformed={item.lastPerformed}
              exercisesCount={item.exercisesCount}
              duration={item.duration}
              onStartPress={() => console.log("Start Routine", item.title)}
            />
          )}
          style={styles.routinesList}
        />

        {/* Recent Activity Section */}
        <SectionHeader title="RECENT ACTIVITY" />
        <View style={styles.activityList}>
          {WorkoutHistory.length > 0 ? (
            WorkoutHistory.map((workout) => {
              console.log("Workout History Item:", workout); // Debug log
              const { day, dayNum } = formatActivityDate(workout.date);

              // Varsayılan ya da hesaplanan hacmi göster
              const volumeText = workout.totalVolume
                ? `${workout.totalVolume} kg`
                : "0 kg";

              return (
                <ActivityRow
                  key={workout.id}
                  day={day}
                  date={dayNum}
                  title={workout.name}
                  duration={
                    workout.duration
                      ? `${Math.round(workout.duration / 60)}m`
                      : "0m"
                  }
                  volume={volumeText}
                  onPress={() => console.log("View Activity", workout.id)}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>No recent workouts found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: 100, // Extra padding for bottom tab bar or FAB
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    fontFamily: "Inter",
  },
  searchBar: {
    marginBottom: spacing.l,
  },
  routinesList: {
    marginHorizontal: -spacing.l, // To allow scrolling edge-to-edge
    paddingHorizontal: spacing.l,
  },
  activityList: {
    gap: spacing.s,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.s,
  },
});
