/**
 * Bottom sheet for logging today's body weight in the user's unit.
 * Validates on save with an inline error (the button is never disabled);
 * offers removing today's entry when there is one.
 */
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { WeightUnit } from "@domain/entities";
import { Weight } from "@domain/value-objects";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { createStyles, gutter, radii, spacing, type } from "@theme";
import { formatDecimal } from "@lib/format";

import { isPlausibleWeightKg } from "../services";

/** Props for {@link LogWeightSheet}. */
export interface LogWeightSheetProps {
  visible: boolean;
  unit: WeightUnit;
  /** Today's logged weight, if any, to prefill and offer removing. */
  todayKg: number | null;
  onSave: (weightKg: number) => void;
  onRemoveToday: () => void;
  onClose: () => void;
}

/** Typed text in the user's unit → kg, or `null` when not a plausible weight. */
export function parseWeightInput(text: string, unit: WeightUnit): number | null {
  const value = Number(text.replace(",", "."));
  if (text.trim() === "" || !Number.isFinite(value)) return null;
  const kg = unit === "kg" ? value : Weight.fromLb(value).toKg();
  return isPlausibleWeightKg(kg) ? kg : null;
}

/** kg → text in the user's unit, one decimal at most. */
function displayText(kg: number, unit: WeightUnit): string {
  const weight = Weight.fromKg(kg);
  return formatDecimal(unit === "kg" ? weight.toKg() : weight.toLb(), 1);
}

/** The log-weight sheet. */
export function LogWeightSheet({ visible, unit, todayKg, onSave, onRemoveToday, onClose }: LogWeightSheetProps): React.ReactElement {
  const styles = useStyles();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  // Re-seed each time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setText(todayKg === null ? "" : displayText(todayKg, unit));
    setError(undefined);
  }, [visible, todayKg, unit]);

  const handleSave = (): void => {
    const kg = parseWeightInput(text, unit);
    if (kg === null) {
      setError(`Enter your weight in ${unit}.`);
      return;
    }
    onSave(kg);
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <View style={styles.content}>
          <Text style={styles.title}>Today’s weight</Text>
          <Input
            autoFocus
            error={error}
            keyboardType="decimal-pad"
            label={`Weight (${unit})`}
            onChangeText={(value) => {
              setText(value);
              setError(undefined);
            }}
            testID="log-weight-input"
            value={text}
          />
          {todayKg !== null ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onRemoveToday();
                onClose();
              }}
              style={styles.remove}
              testID="log-weight-remove"
            >
              <Text style={styles.removeLabel}>Remove today’s entry</Text>
            </Pressable>
          ) : null}
          <View style={styles.save}>
            <Button fullWidth label="Save" onPress={handleSave} testID="log-weight-save" />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = createStyles((colors) => ({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.backdrop },
  sheet: {
    marginTop: "auto",
    backgroundColor: colors.canvasRaised,
    borderTopLeftRadius: radii.stage,
    borderTopRightRadius: radii.stage,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  content: { paddingHorizontal: gutter, paddingTop: spacing.xxl, paddingBottom: spacing.xl, gap: spacing.lg },
  title: { ...type.sectionTitle, color: colors.textPrimary },
  remove: { minHeight: 44, justifyContent: "center" },
  removeLabel: { ...type.button, color: colors.error },
  save: { marginTop: spacing.sm },
}));
