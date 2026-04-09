import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors, spacing } from "../../theme";

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<ViewStyle>;
  actionStyle?: StyleProp<ViewStyle>;
}

export const SectionHeader = ({
  title,
  actionText,
  onActionPress,
  style,
  titleStyle,
  actionStyle,
}: SectionHeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {actionText && (
        <TouchableOpacity
          onPress={onActionPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.action, actionStyle]}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.m,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  action: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.primary,
    textTransform: "uppercase",
  },
});
