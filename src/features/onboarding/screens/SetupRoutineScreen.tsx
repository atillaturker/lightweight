/**
 * Onboarding setup step 3 — the first routine.
 *
 * The final setup step: taller rows because each option carries a
 * description, and a "Get started" primary action instead of "Continue".
 * Completing it creates the chosen starter routine (or nothing, for the
 * "from scratch" option), marks the auth user as onboarded, and resets the
 * draft. The root navigator sees `hasOnboarded` flip and swaps to the main
 * tabs — this screen never navigates by hand.
 */
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { useAuthStore } from "@features/auth";
import { useRoutineStore } from "@features/routines";

import type { OnboardingStackParamList } from "@/app/navigation/types";
import { SetupOptionRow } from "../components/SetupOptionRow";
import { SetupTopRow } from "../components/SetupTopRow";
import { useOnboardingStore } from "../store/onboardingStore";
import type { RoutineChoice } from "../types";
import { styles } from "./onboardingScreen.styles";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetupRoutine">;

/** The offered first-routine choices, in display order. */
const ROUTINE_OPTIONS: readonly {
  value: RoutineChoice;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "ppl",
    title: "Push / Pull / Legs",
    subtitle: "3 sessions · 18 exercises",
  },
  {
    value: "upper-lower",
    title: "Upper / Lower",
    subtitle: "2 sessions · 12 exercises",
  },
  {
    value: "full-body",
    title: "Full Body",
    subtitle: "3 sessions · 15 exercises",
  },
  {
    value: "scratch",
    title: "Start from scratch",
    subtitle: "Build your own routine",
  },
];

/** First-routine step and the flow's completion point. */
export function SetupRoutineScreen({ navigation }: Props): React.ReactElement {
  const routineChoice = useOnboardingStore((state) => state.routineChoice);
  const setRoutineChoice = useOnboardingStore((state) => state.setRoutineChoice);
  const resetDraft = useOnboardingStore((state) => state.reset);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const seedFromTemplate = useRoutineStore((state) => state.seedFromTemplate);

  const handleGetStarted = (): void => {
    // "Start from scratch" deliberately creates nothing — the user builds
    // a routine from the empty Home screen instead.
    if (routineChoice !== "scratch") {
      seedFromTemplate(routineChoice);
    }
    completeOnboarding();
    resetDraft();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <SetupTopRow
        current={3}
        onBack={navigation.goBack}
        testID="setup-routine-top"
      />

      <View style={styles.setupBody}>
        <Text style={styles.setupHeadline}>Start with a routine</Text>
        <Text style={styles.setupSupporting}>
          Pick a template to get started, or build your own.
        </Text>

        <View style={styles.options}>
          {ROUTINE_OPTIONS.map((option, index) => (
            <View key={option.value}>
              {index > 0 ? <View style={styles.rowDivider} /> : null}
              <SetupOptionRow
                onPress={() => setRoutineChoice(option.value)}
                selected={routineChoice === option.value}
                subtitle={option.subtitle}
                testID={`setup-routine-${option.value}`}
                title={option.title}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          fullWidth
          label="Get started"
          onPress={handleGetStarted}
          testID="setup-routine-submit"
        />
      </View>
    </SafeAreaView>
  );
}
