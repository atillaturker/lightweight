/**
 * Plate calculator: a target weight with −/+ steps, the bar choice, and
 * what goes on each side. Works in the user's display unit, since a gym's
 * plates come in one unit. Opened from an exercise block's options.
 */
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { WeightUnit } from '@domain/entities';
import { BAR_WEIGHTS, calculatePlates, STANDARD_PLATES } from '@domain/rules';
import { SegmentedControl } from '@components/SegmentedControl';
import { radii, spacing, type, createStyles } from '@theme';
import { formatDecimal } from '@lib/format';

import { PLATE_TARGET_STEP } from '../utils/plateTarget';

import { PlateDiagram } from './PlateDiagram';

/** Props for {@link PlateCalculatorPanel}. */
export interface PlateCalculatorPanelProps {
  /** Starting total, in `unit`. */
  initialTarget: number;
  unit: WeightUnit;
}

/** `100`, `62.5`, `1.25`: only the decimals the value needs. */
function plateNumber(value: number): string {
  return formatDecimal(value, 2);
}

/** `100 kg`, `2.5 lb`. */
function amount(value: number, unit: WeightUnit): string {
  return `${plateNumber(value)} ${unit}`;
}

/** One −/+ step control. */
function StepButton({ label, onPress }: { label: string; onPress: () => void }): React.ReactElement {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityLabel={label === '−' ? 'Decrease weight' : 'Increase weight'}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.step}
      testID={label === '−' ? 'plate-calculator-decrease' : 'plate-calculator-increase'}
    >
      <Text style={styles.stepLabel}>{label}</Text>
    </Pressable>
  );
}

/** The calculator body; the sheet around it is the caller's. */
export function PlateCalculatorPanel({ initialTarget, unit }: PlateCalculatorPanelProps): React.ReactElement {
  const styles = useStyles();
  const bars = BAR_WEIGHTS[unit];
  const plates = STANDARD_PLATES[unit];
  const step = PLATE_TARGET_STEP[unit];
  const [target, setTarget] = useState(initialTarget);
  const [bar, setBar] = useState(bars[0]);
  const load = calculatePlates(target, bar, plates);

  const perSide =
    load.perSide.length === 0 ? 'Just the bar' : `Per side · ${load.perSide.map(plateNumber).join(' + ')} ${unit}`;

  return (
    <View testID="plate-calculator">
      <View style={styles.targetRow}>
        <StepButton label="−" onPress={() => setTarget((value) => Math.max(bar, value - step))} />
        <Text style={styles.target} testID="plate-calculator-target">
          {amount(target, unit)}
        </Text>
        <StepButton label="+" onPress={() => setTarget((value) => value + step)} />
      </View>

      <View style={styles.diagram}>
        <PlateDiagram maxPlate={plates[0]} plates={load.perSide} testID="plate-calculator-diagram" />
      </View>
      <Text style={styles.perSide} testID="plate-calculator-per-side">
        {perSide}
      </Text>
      {load.remainder > 0 ? (
        <Text style={styles.remainder} testID="plate-calculator-remainder">
          {`Closest is ${amount(load.loaded, unit)}; ${amount(load.remainder, unit)} can't be loaded.`}
        </Text>
      ) : null}

      <Text style={styles.barLabel}>BAR</Text>
      <SegmentedControl
        onChange={(value) => setBar(Number(value))}
        options={bars.map((weight) => ({ value: String(weight), label: amount(weight, unit) }))}
        testID="plate-calculator-bar"
        value={String(bar)}
      />
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  step: {
    width: 44,
    height: 44,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    ...type.bodyLarge,
    color: colors.textPrimary,
  },
  target: {
    ...type.metricLarge,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  diagram: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  perSide: {
    ...type.body,
    marginTop: spacing.md,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  remainder: {
    ...type.bodySmall,
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.textMuted,
  },
  barLabel: {
    ...type.labelSmall,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.textMuted,
  },
}));
