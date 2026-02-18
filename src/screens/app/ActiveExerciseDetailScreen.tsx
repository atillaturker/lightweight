import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActiveExerciseCard } from "../../components/workout/ActiveExerciseCard";
import { Header } from "../../components/ui/Header";
import { StatsBar } from "../../components/ui/StatsBar";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addSet,
  removeExercise,
  removeSet,
  updateSet,
} from "../../store/slices/workoutSlice";
import { colors, spacing } from "../../theme";
import { MUSCLE_GROUP_CONFIG } from "../../utils/muscleGroupConfig";

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

  const handleSave = () => {
    navigation.goBack();
  };

  const handleDelete = () => {
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
  };

  if (!exercise) return null;

  const config =
    MUSCLE_GROUP_CONFIG[exercise.muscleGroup] ?? MUSCLE_GROUP_CONFIG.other;
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="Edit Exercise"
        onLeftPress={() => navigation.goBack()}
        rightText="SAVE"
        onRightPress={handleSave}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Info Card */}
        <View style={styles.infoCard}>
          <View
            style={[
              styles.infoIconWrapper,
              { backgroundColor: config.bgColor },
            ]}
          >
            <Ionicons name={config.icon} size={28} color={config.color} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.infoMeta}>
              {exercise.category && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>{exercise.category}</Text>
                </View>
              )}
              <View
                style={[styles.infoBadge, { backgroundColor: config.bgColor }]}
              >
                <Text style={[styles.infoBadgeText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.semantic.error}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <StatsBar
          stats={[
            {
              label: "Total Sets",
              value: totalSets,
              icon: "layers-outline",
            },
            {
              label: "Completed",
              value: `${completedSets}/${totalSets}`,
              icon: "checkmark-circle-outline",
            },
            {
              label: "Volume",
              value: totalVolume > 0 ? `${totalVolume}kg` : "0kg",
              icon: "barbell-outline",
            },
          ]}
          style={{ marginHorizontal: 0 }}
        />

        {/* Active Exercise Card (for editing sets) */}
        <View style={styles.cardContainer}>
          <ActiveExerciseCard
            exercise={exercise}
            onAddSet={() => dispatch(addSet({ exerciseInstanceId }))}
            onRemoveSet={(setId) =>
              dispatch(removeSet({ exerciseInstanceId, setId }))
            }
            onUpdateSet={(setId, field, value) =>
              dispatch(
                updateSet({
                  exerciseInstanceId,
                  setId,
                  field,
                  value,
                }),
              )
            }
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
    backgroundColor: colors.background.primary,
  },
  // Scroll
  scrollContent: {
    padding: spacing.l,
    paddingBottom: 120,
  },
  // Info card
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.l,
    borderRadius: 16,
    gap: spacing.m,
  },
  infoIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
    gap: 6,
  },
  exerciseName: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  infoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoBadgeText: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: "600",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Card container
  cardContainer: {
    marginTop: spacing.m,
  },
});
