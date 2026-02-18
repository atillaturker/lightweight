import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
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
import { startWorkout } from "../../store/slices/workoutSlice";
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
];

export const WorkoutScreen = () => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const activeWorkout = useAppSelector((state) => state.workout.activeWorkout);
  // Get history from Redux
  const history = useAppSelector((state) => state.workout.history);

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
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}

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
          {history.length > 0 ? (
            history.map((workout) => {
              const { day, dayNum } = formatActivityDate(workout.startTime);
              // Calculate volume and duration properly in future
              const volume = "0kg";
              const duration = "0m";

              return (
                <ActivityRow
                  key={workout.id}
                  day={day}
                  date={dayNum}
                  title={workout.name}
                  duration={duration}
                  volume={volume}
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
    paddingVertical: spacing.m,
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
