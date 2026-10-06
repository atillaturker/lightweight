/**
 * Summary → "Muscles worked": the session's training load on the body
 * map. Display-only; the detailed, tappable map lives on Progress.
 */
import React from "react";
import { View } from "react-native";

import type { BodyRegion, IntensityLevel } from "@domain/rules";
import { BODY_REGION_LABELS, BodyMap } from "@components/BodyMap";
import { SectionHeader } from "@components/SectionHeader";
import { createStyles, spacing } from "@theme";

/** Props for {@link MusclesWorked}. */
export interface MusclesWorkedProps {
  levels: Record<BodyRegion, IntensityLevel>;
  /** Regions with any work, most first; for the spoken summary. */
  trained: BodyRegion[];
  width: number;
  testID?: string;
}

/** Section with a display-only body map. */
export function MusclesWorked({ levels, trained, width, testID }: MusclesWorkedProps): React.ReactElement {
  const styles = useStyles();
  const spoken = `Muscles worked: ${trained.map((region) => BODY_REGION_LABELS[region]).join(", ")}`;
  return (
    <View testID={testID}>
      <SectionHeader label="Muscles worked" variant="rule" />
      <View style={styles.map}>
        <BodyMap accessibilityLabel={spoken} levels={levels} testID={testID ? `${testID}-map` : undefined} width={width} />
      </View>
    </View>
  );
}

const useStyles = createStyles(() => ({
  map: { marginTop: spacing.lg },
}));
