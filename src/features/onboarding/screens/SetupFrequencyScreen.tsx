/**
 * Onboarding setup step 2 — weekly training frequency.
 *
 * The first setup step with a back target, so it renders the back chevron
 * and marks the second bar of the progress rail.
 */
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";

import type { OnboardingStackParamList } from "@/app/navigation/types";
import { SetupOptionRow } from "../components/SetupOptionRow";
import { SetupTopRow } from "../components/SetupTopRow";
import { useOnboardingStore } from "../store/onboardingStore";
import type { TrainingFrequency } from "../types";
import { styles } from "./onboardingScreen.styles";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetupFrequency">;

/** The offered frequency targets, in display order. */
const FREQUENCY_OPTIONS: ReadonlyArray<{
  value: TrainingFrequency;
  label: string;
}> = [
  { value: "2-3", label: "2–3 days per week" },
  { value: "4", label: "4 days per week" },
  { value: "5", label: "5 days per week" },
  { value: "6+", label: "6+ days per week" },
];

/** Weekly-frequency step: a single-select list of four targets. */
export function SetupFrequencyScreen({
  navigation,
}: Props): React.ReactElement {
  const frequency = useOnboardingStore((state) => state.frequency);
  const setFrequency = useOnboardingStore((state) => state.setFrequency);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <SetupTopRow
        current={2}
        onBack={navigation.goBack}
        testID="setup-frequency-top"
      />

      <View style={styles.setupBody}>
        <Text style={styles.setupHeadline}>How often do you train?</Text>
        <Text style={styles.setupSupporting}>
          We use this to set your weekly goal. You can change it later.
        </Text>

        <View style={styles.options}>
          {FREQUENCY_OPTIONS.map((option, index) => (
            <View key={option.value}>
              {index > 0 ? <View style={styles.rowDivider} /> : null}
              <SetupOptionRow
                onPress={() => setFrequency(option.value)}
                selected={frequency === option.value}
                testID={`setup-frequency-${option.value}`}
                title={option.label}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={() => navigation.navigate("SetupRoutine")}
          testID="setup-frequency-continue"
        />
      </View>
    </SafeAreaView>
  );
}
