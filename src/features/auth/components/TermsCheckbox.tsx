import React from "react";
import { Pressable, Text, View } from "react-native";

import { styles, TERMS_HIT_SLOP } from "./TermsCheckbox.styles";

/** Props for {@link TermsCheckbox}. */
export interface TermsCheckboxProps {
  /** Current checked state. */
  checked: boolean;
  /** Called when the row is pressed. */
  onToggle: () => void;
  /** Optional validation message rendered under the row. */
  error?: string;
  testID?: string;
}

/**
 * Terms and Privacy Policy consent row.
 *
 * The 18px square box (4px radius) is a sibling of the 44px-tall pressable
 * row, so the larger tap target never inflates the drawn square. The box,
 * not the whole row, carries the tap semantics.
 */
export function TermsCheckbox({
  checked,
  onToggle,
  error,
  testID,
}: TermsCheckboxProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel="I agree to the Terms and Privacy Policy"
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          hitSlop={TERMS_HIT_SLOP}
          onPress={onToggle}
          style={[styles.box, checked && styles.boxChecked]}
          testID={testID}
        >
          {checked ? <Text style={styles.check}>✓</Text> : null}
        </Pressable>

        <Text style={styles.label}>
          I agree to the <Text style={styles.link}>Terms</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>

      {error ? (
        <Text aria-live="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
