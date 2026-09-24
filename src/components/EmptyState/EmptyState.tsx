import React from "react";
import { Text, View, type ViewProps } from "react-native";

import { styles } from "./EmptyState.styles";

/** Props for {@link EmptyState}. */
export interface EmptyStateProps
  extends Omit<ViewProps, "style" | "children"> {
  title: string;
  message?: string;
  /** Optional action node, typically a {@link Button} or text action. */
  action?: React.ReactNode;
  testID?: string;
}

/**
 * Text-only empty state. No illustration, icon, or decorative graphic —
 * a title, an optional muted message, and an optional caller-styled
 * action. Natural height; placement is the caller's responsibility.
 */
export function EmptyState({
  title,
  message,
  action,
  testID,
  ...rest
}: EmptyStateProps): React.ReactElement {
  return (
    <View style={styles.container} testID={testID} {...rest}>
      <Text style={[styles.title, message ? styles.titleWithMessage : null]}>
        {title}
      </Text>

      {message ? (
        <Text style={styles.message} testID={testID ? `${testID}-message` : undefined}>
          {message}
        </Text>
      ) : null}

      {action ? (
        <View style={styles.action} testID={testID ? `${testID}-action` : undefined}>
          {action}
        </View>
      ) : null}
    </View>
  );
}
