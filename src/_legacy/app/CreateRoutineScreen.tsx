import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SCREENS } from "../../navigation/screenNames";
import { AppStackParamList } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  cancelRoutineDraft,
  removeExerciseFromRoutineDraft,
  saveUserRoutine,
  updateRoutineDraftName,
} from "../../store/slices/workoutSlice";
import { theme } from "../../theme";
import { Routine } from "../../types/workout";

export const CreateRoutineScreen = () => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const draftRoutine = useAppSelector((state) => state.workout.draftRoutine);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Routine",
      "Are you sure you want to discard this routine?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            dispatch(cancelRoutineDraft());
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleSave = () => {
    if (!draftRoutine?.name?.trim()) {
      Alert.alert("Error", "Please provide a name for your routine.");
      return;
    }
    if (!draftRoutine?.exercises || draftRoutine.exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise.");
      return;
    }

    const newRoutine: Routine = {
      id: Date.now().toString(),
      userId: "", // Will be set in thunk
      name: draftRoutine.name.trim(),
      exercises: draftRoutine.exercises,
      createdAt: new Date().toISOString(),
    };

    dispatch(saveUserRoutine(newRoutine)).then(() => {
      dispatch(cancelRoutineDraft());
      navigation.goBack();
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.nameInput}
          value={draftRoutine?.name || ""}
          onChangeText={(text) => dispatch(updateRoutineDraftName(text))}
          placeholder="Routine Name"
          placeholderTextColor={theme.colors.text.tertiary}
        />
        <TouchableOpacity
          onPress={handleSave}
          style={[
            styles.headerButton,
            { opacity: draftRoutine?.name?.trim() ? 1 : 0.5 },
          ]}
        >
          <Text
            style={[
              styles.headerButtonText,
              { color: theme.colors.brand.primary },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {draftRoutine?.exercises?.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseWrapper}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseTitle}>
                {index + 1}. {exercise.name}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  dispatch(removeExerciseFromRoutineDraft(exercise.id))
                }
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.semantic.error}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.setsInfo}>
              <Text style={styles.setsText}>
                {exercise.sets.length} Set
                {exercise.sets.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() =>
            navigation.navigate(SCREENS.EXERCISE_SELECTOR, { isRoutine: true })
          }
        >
          <Ionicons name="add" size={20} color={theme.colors.brand.primary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.m,
    paddingTop: Platform.OS === "ios" ? 50 : theme.spacing.l,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
  },
  headerButton: {
    padding: theme.spacing.s,
  },
  headerButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.m,
    fontWeight: "600",
  },
  nameInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.l,
    fontFamily: theme.typography.fonts.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: 100,
  },
  exerciseWrapper: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radii.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.s,
  },
  exerciseTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.m,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.primary,
  },
  setsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  setsText: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.s,
    fontFamily: theme.typography.fonts.primary,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.m,
    borderRadius: theme.radii.l,
    backgroundColor: "rgba(19, 127, 236, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(19, 127, 236, 0.2)",
    marginBottom: theme.spacing.xl,
  },
  addExerciseText: {
    color: theme.colors.brand.primary,
    fontSize: theme.typography.sizes.m,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
    fontFamily: theme.typography.fonts.primary,
  },
});
