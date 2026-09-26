import React from "react";
import { Text, View } from "react-native";

import { styles } from "./AuthDivider.styles";

/**
 * Hairline separator with a centred "or" pill riding over it.
 *
 * Used between the primary CTA and the provider buttons. The pill is
 * filled with the canvas colour so the hairline appears to pass behind
 * it, and it uses the badge radius (pill), never a control radius.
 */
export function AuthDivider(): React.ReactElement {
  return (
    <View
      accessibilityRole="none"
      accessible={false}
      style={styles.container}
    >
      <View style={styles.rule} />
      <View style={styles.pill}>
        <Text style={styles.pillLabel}>or</Text>
      </View>
    </View>
  );
}
