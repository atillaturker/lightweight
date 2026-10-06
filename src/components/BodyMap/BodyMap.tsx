/**
 * Body map (DESIGN.md §5.4 "Muscle map"): a front and a back figure whose regions are
 * shaded on the intensity scale by how much work they got. Tapping a
 * region selects it (accent outline) so the caller can show its exact
 * value; tapping it again clears the selection. Accent never shades a
 * region — it only marks the selected one.
 */
import React from "react";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { BodyRegion, IntensityLevel } from "@domain/rules";
import { createStyles, spacing, type, useTheme, type ColorPalette } from "@theme";

import {
  BACK_CENTER,
  BACK_SIDES,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  FRONT_CENTER,
  FRONT_SIDES,
  INERT_CENTER,
  INERT_SIDES,
  mirrorPath,
  type RegionShapes,
} from "./bodyMapShapes";

/** Props for {@link BodyMap}. */
export interface BodyMapProps {
  levels: Record<BodyRegion, IntensityLevel>;
  /** Region outlined in accent, if any. */
  selected?: BodyRegion | null;
  /** Omit for a display-only map (regions are then not pressable). */
  onSelect?: (region: BodyRegion | null) => void;
  /** Width available for both figures together. */
  width: number;
  /** Spoken summary, since individual regions are not focusable. */
  accessibilityLabel: string;
  testID?: string;
}

const FIGURE_GAP = spacing.lg;

/** Intensity step → token. */
function fillFor(colors: ColorPalette, level: IntensityLevel): string {
  return [colors.intensity0, colors.intensity1, colors.intensity2, colors.intensity3, colors.intensity4][level];
}

/** Every path of a figure's regions, both sides. */
function regionPaths(sides: RegionShapes, center: RegionShapes): [BodyRegion, string][] {
  const paths: [BodyRegion, string][] = [];
  for (const [region, shapes] of Object.entries(sides) as [BodyRegion, readonly string[]][]) {
    for (const d of shapes) paths.push([region, d], [region, mirrorPath(d)]);
  }
  for (const [region, shapes] of Object.entries(center) as [BodyRegion, readonly string[]][]) {
    for (const d of shapes) paths.push([region, d]);
  }
  return paths;
}

const FRONT_PATHS = regionPaths(FRONT_SIDES, FRONT_CENTER);
const BACK_PATHS = regionPaths(BACK_SIDES, BACK_CENTER);
const INERT_PATHS = [...INERT_SIDES, ...INERT_SIDES.map(mirrorPath), ...INERT_CENTER];

/** One figure. */
function Figure({
  paths,
  levels,
  selected,
  onSelect,
  width,
  testID,
}: {
  paths: [BodyRegion, string][];
  levels: Record<BodyRegion, IntensityLevel>;
  selected: BodyRegion | null;
  onSelect?: (region: BodyRegion | null) => void;
  width: number;
  testID: string;
}): React.ReactElement {
  const { colors } = useTheme();
  const height = (width * FIGURE_HEIGHT) / FIGURE_WIDTH;
  return (
    <Svg height={height} testID={testID} viewBox={`0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}`} width={width}>
      {INERT_PATHS.map((d) => (
        <Path d={d} fill={colors.intensity0} key={d} stroke={colors.canvas} strokeWidth={0.8} />
      ))}
      {paths.map(([region, d]) => {
        const isSelected = region === selected;
        return (
          <Path
            d={d}
            fill={fillFor(colors, levels[region])}
            key={`${region}-${d}`}
            onPress={onSelect === undefined ? undefined : () => onSelect(isSelected ? null : region)}
            stroke={isSelected ? colors.accent : colors.canvas}
            strokeLinejoin="round"
            strokeWidth={isSelected ? 1.5 : 0.8}
            testID={`${testID}-${region}`}
          />
        );
      })}
    </Svg>
  );
}

/** Front and back figures side by side, captioned. */
export function BodyMap({
  levels,
  selected = null,
  onSelect,
  width,
  accessibilityLabel,
  testID = "body-map",
}: BodyMapProps): React.ReactElement {
  const styles = useStyles();
  const figureWidth = (width - FIGURE_GAP) / 2;
  return (
    <View accessibilityLabel={accessibilityLabel} accessible style={styles.row} testID={testID}>
      <View style={styles.figure}>
        <Figure levels={levels} onSelect={onSelect} paths={FRONT_PATHS} selected={selected} testID={`${testID}-front`} width={figureWidth} />
        <Text style={styles.caption}>Front</Text>
      </View>
      <View style={styles.figure}>
        <Figure levels={levels} onSelect={onSelect} paths={BACK_PATHS} selected={selected} testID={`${testID}-back`} width={figureWidth} />
        <Text style={styles.caption}>Back</Text>
      </View>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  row: { flexDirection: "row", gap: FIGURE_GAP },
  figure: { flex: 1, alignItems: "center", gap: spacing.xs },
  caption: { ...type.caption, color: colors.textMuted },
}));
