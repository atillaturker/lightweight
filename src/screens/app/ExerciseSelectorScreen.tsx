import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/ui/EmptyState";
import { SearchBar } from "../../components/ui/SearchBar";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addExerciseToRoutineDraft,
  addExerciseToWorkout,
} from "../../store/slices/workoutSlice";
import { theme } from "../../theme";
import { Exercise, MuscleGroup } from "../../types/workout";
import { MUSCLE_GROUP_CONFIG } from "../../utils/muscleGroupConfig";

const ALL_MUSCLE_GROUPS: Array<MuscleGroup | "all"> = [
  "all",
  "chest",
  "back",
  "legs",
  "shoulders",
  "biceps",
  "triceps",
  "abs",
  "cardio",
  "other",
];

export const ExerciseSelectorScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route =
    useRoute<RouteProp<AppStackParamList, typeof SCREENS.EXERCISE_SELECTOR>>();
  const isRoutine = route.params?.isRoutine;

  const dispatch = useAppDispatch();
  const availableExercises = useAppSelector(
    (state) => state.workout.availableExercises,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<
    MuscleGroup | "all"
  >("all");

  const filteredExercises = useMemo(() => {
    return availableExercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesMuscle =
        selectedMuscleGroup === "all" || ex.muscleGroup === selectedMuscleGroup;
      return matchesSearch && matchesMuscle;
    });
  }, [availableExercises, searchQuery, selectedMuscleGroup]);

  // Group exercises by muscle group for section display
  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    filteredExercises.forEach((ex) => {
      const key = ex.muscleGroup;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ex);
    });
    return Object.entries(groups).map(([muscleGroup, exercises]) => ({
      muscleGroup: muscleGroup as MuscleGroup,
      exercises,
    }));
  }, [filteredExercises]);

  const handleSelectExercise = (exercise: Exercise) => {
    const instanceId = Date.now().toString();
    if (isRoutine) {
      dispatch(addExerciseToRoutineDraft({ exercise, instanceId }));
      navigation.goBack(); // Back to CreateRoutineScreen
    } else {
      dispatch(addExerciseToWorkout({ exercise, instanceId }));
      navigation.replace(SCREENS.ACTIVE_EXERCISE_DETAIL, {
        exerciseInstanceId: instanceId,
      });
    }
  };

  const renderExerciseItem = (item: Exercise) => {
    const config =
      MUSCLE_GROUP_CONFIG[item.muscleGroup] ?? MUSCLE_GROUP_CONFIG.other;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.exerciseItem}
        onPress={() => handleSelectExercise(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.exerciseIcon, { backgroundColor: config.bgColor }]}
        >
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <View style={styles.exerciseMeta}>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
            <View
              style={[styles.muscleBadge, { backgroundColor: config.bgColor }]}
            >
              <Text style={[styles.muscleText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.addIconWrapper}>
          <Ionicons name="add" size={18} color={theme.colors.brand.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Select Exercise</Text>
          <Text style={styles.subtitle}>
            {filteredExercises.length} exercise
            {filteredExercises.length !== 1 ? "s" : ""} available
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Muscle Group Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {ALL_MUSCLE_GROUPS.map((group) => {
            const isSelected = selectedMuscleGroup === group;
            const config = group === "all" ? null : MUSCLE_GROUP_CONFIG[group];
            return (
              <TouchableOpacity
                key={group}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                  isSelected &&
                    config && {
                      backgroundColor: config.bgColor,
                      borderColor: config.color,
                    },
                  isSelected &&
                    !config && {
                      backgroundColor: "rgba(19, 127, 236, 0.15)",
                      borderColor: theme.colors.brand.primary,
                    },
                ]}
                onPress={() => setSelectedMuscleGroup(group)}
                activeOpacity={0.7}
              >
                {config && (
                  <Ionicons
                    name={config.icon}
                    size={14}
                    color={
                      isSelected ? config.color : theme.colors.text.tertiary
                    }
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && config && { color: config.color },
                    isSelected &&
                      !config && { color: theme.colors.brand.primary },
                  ]}
                >
                  {group === "all" ? "All" : (config?.label ?? group)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={groupedExercises}
        keyExtractor={(item) => item.muscleGroup}
        renderItem={({ item: group }) => (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionDot,
                  {
                    backgroundColor:
                      MUSCLE_GROUP_CONFIG[group.muscleGroup]?.color ??
                      theme.colors.text.tertiary,
                  },
                ]}
              />
              <Text style={styles.sectionTitle}>
                {MUSCLE_GROUP_CONFIG[group.muscleGroup]?.label ??
                  group.muscleGroup}
              </Text>
              <Text style={styles.sectionCount}>{group.exercises.length}</Text>
            </View>
            {group.exercises.map(renderExerciseItem)}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No Exercises Found"
            subtitle="Try adjusting your search or filters"
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "800",
    fontFamily: theme.typography.fonts.primary,
  },
  subtitle: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.s,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.m,
    backgroundColor: theme.colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  // Search
  searchContainer: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  // Filter chips
  filterContainer: {
    paddingBottom: theme.spacing.m,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.s,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 4,
  },
  filterChipActive: {
    borderWidth: 1,
  },
  filterChipText: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.s,
    fontWeight: "600",
  },
  // Sections
  sectionContainer: {
    marginBottom: theme.spacing.m,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.s,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.s,
  },
  sectionTitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.s,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    flex: 1,
  },
  sectionCount: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: "600",
  },
  // Exercise item
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    gap: theme.spacing.m,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.l,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.m,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.primary,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.m,
  },
  categoryText: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: "600",
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.m,
  },
  muscleText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: "600",
  },
  addIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.m,
    alignItems: "center",
    justifyContent: "center",
  },
  // List
  listContent: {
    paddingBottom: 100,
  },
});
