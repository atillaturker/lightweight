import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components/ui/Header";
import { ExerciseBreakdownCard } from "../../components/workout/ExerciseBreakdownCard";
import { WorkoutDetailHero } from "../../components/workout/WorkoutDetailHero";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppSelector } from "../../store";
import { theme } from "../../theme";

type RouteProps = RouteProp<AppStackParamList, typeof SCREENS.WORKOUT_DETAIL>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const WorkoutDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { workoutId } = route.params;

  const workout = useAppSelector((state) =>
    state.workout.history.find((w) => w.id === workoutId),
  );

  if (!workout) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="Workout Details"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="settings-outline"
        onRightPress={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WorkoutDetailHero workout={workout} />

        {workout.exercises.length > 0 && (
          <Text style={styles.sectionTitle}>Exercise Breakdown</Text>
        )}

        {workout.exercises.map((exercise) => (
          <ExerciseBreakdownCard key={exercise.id} exercise={exercise} />
        ))}

        {workout.notes && (
          <>
            <Text style={styles.sectionTitle}>Workout Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>"{workout.notes}"</Text>
            </View>
          </>
        )}
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
    paddingVertical: theme.spacing.l,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.l,
    fontWeight: "800",
    fontFamily: theme.typography.fonts.primary,
    marginHorizontal: theme.spacing.l,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.m,
  },
  notesCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radii.xl,
    marginHorizontal: theme.spacing.l,
    padding: theme.spacing.l,
  },
  notesText: {
    color: theme.colors.text.secondary,
    fontStyle: "italic",
    fontSize: theme.typography.sizes.s,
    fontFamily: theme.typography.fonts.primary,
    lineHeight: 20,
  },
});
