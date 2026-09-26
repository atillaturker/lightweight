/**
 * Onboarding setup step 1 — weight unit.
 *
 * The first required step: no back chevron, progress rail on the first
 * bar. The choice is written to the non-persisted onboarding draft store,
 * so it survives while the user walks the flow but not a cold start.
 */
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import type { WeightUnit } from "@domain/entities";

import type { OnboardingStackParamList } from "@/app/navigation/types";
import { SetupOptionRow } from "../components/SetupOptionRow";
import { SetupTopRow } from "../components/SetupTopRow";
import { useOnboardingStore } from "../store/onboardingStore";
import { styles } from "./onboardingScreen.styles";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetupUnits">;

/** The two offered unit systems, in display order. */
const UNIT_OPTIONS: ReadonlyArray<{ value: WeightUnit; label: string }> = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
];

/**
 * Unit-selection step. Rendering the hairline between rows rather than
 * under every row keeps the list unbounded at both ends.
 */
export function SetupUnitsScreen({ navigation }: Props): React.ReactElement {
  const unit = useOnboardingStore((state) => state.unit);
  const setUnit = useOnboardingStore((state) => state.setUnit);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <SetupTopRow current={1} testID="setup-units-top" />

      <View style={styles.setupBody}>
        <Text style={styles.setupHeadline}>Choose your units</Text>
        <Text style={styles.setupSupporting}>
          You can change this anytime in settings.
        </Text>

        <View style={styles.options}>
          {UNIT_OPTIONS.map((option, index) => (
            <View key={option.value}>
              {index > 0 ? <View style={styles.rowDivider} /> : null}
              <SetupOptionRow
                onPress={() => setUnit(option.value)}
                selected={unit === option.value}
                testID={`setup-units-${option.value}`}
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
          onPress={() => navigation.navigate("SetupFrequency")}
          testID="setup-units-continue"
        />
      </View>
    </SafeAreaView>
  );
}
