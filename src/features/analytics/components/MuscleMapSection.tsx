/**
 * Progress → "Muscles": where the training went over the last week, month
 * or three months. The map shades each region by its load; tapping one
 * shows its exact set count above the map (DESIGN.md §5.3: exact values on
 * tap, no floating tooltip), and the regions left untrained are listed
 * below it.
 */
import React, { useState } from "react";
import { Text, View } from "react-native";

import { BODY_REGIONS, type BodyRegion } from "@domain/rules";
import { BODY_REGION_LABELS as REGION_LABELS, BodyMap } from "@components/BodyMap";
import { SectionHeader } from "@components/SectionHeader";
import { SegmentedControl } from "@components/SegmentedControl";
import { createStyles, spacing, type } from "@theme";
import { formatDecimal } from "@lib/format";

import { useMuscleMap } from "../hooks";
import type { MuscleMapData, MuscleWindow } from "../utils";

const WINDOW_OPTIONS = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "3 months" },
];

/** "Chest · 8.5 sets", or a hint when nothing is selected. */
function readoutText(data: MuscleMapData, selected: BodyRegion | null): string {
  if (!data.hasData) return "Log a workout to see which muscles you trained.";
  if (selected === null) return "Tap a muscle to see its sets.";
  const sets = data.load[selected];
  return `${REGION_LABELS[selected]} · ${formatDecimal(sets)} ${sets === 1 ? "set" : "sets"}`;
}

/** "Not trained: Calves, Hamstrings", or that everything was. */
function untrainedText(data: MuscleMapData): string | null {
  if (!data.hasData) return null;
  if (data.untrained.length === 0) return "Every muscle group got work.";
  return `Not trained: ${data.untrained.map((region) => REGION_LABELS[region]).join(", ")}`;
}

/** Spoken summary of the map: the three most-trained regions, then the gaps. */
function spokenSummary(data: MuscleMapData): string {
  const top = [...BODY_REGIONS]
    .filter((region) => data.load[region] > 0)
    .sort((a, b) => data.load[b] - data.load[a])
    .slice(0, 3)
    .map((region) => REGION_LABELS[region]);
  const most = top.length === 0 ? "No muscles trained." : `Most trained: ${top.join(", ")}.`;
  return [most, untrainedText(data)].filter((part) => part !== null).join(" ");
}

/** Props for {@link MuscleMapSection}. */
export interface MuscleMapSectionProps {
  /** Width of the content column. */
  width: number;
}

/** The muscle map with its window control, readout and gaps list. */
export function MuscleMapSection({ width }: MuscleMapSectionProps): React.ReactElement {
  const styles = useStyles();
  const [span, setSpan] = useState<MuscleWindow>("week");
  const [selected, setSelected] = useState<BodyRegion | null>(null);
  const data = useMuscleMap(span);
  const gaps = untrainedText(data);

  return (
    <View testID="muscle-map-section">
      <SectionHeader label="Muscles" variant="rule" />
      <View style={styles.control}>
        <SegmentedControl
          onChange={(value) => setSpan(value as MuscleWindow)}
          options={WINDOW_OPTIONS}
          testID="muscle-map-window"
          value={span}
        />
      </View>
      <Text style={styles.readout} testID="muscle-map-readout">
        {readoutText(data, selected)}
      </Text>
      <BodyMap
        accessibilityLabel={spokenSummary(data)}
        levels={data.levels}
        onSelect={setSelected}
        selected={selected}
        testID="muscle-map"
        width={width}
      />
      {gaps !== null ? (
        <Text style={styles.gaps} testID="muscle-map-untrained">
          {gaps}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  control: { marginTop: spacing.md },
  readout: {
    ...type.label,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  gaps: { ...type.bodySmall, marginTop: spacing.md, color: colors.textMuted },
}));
