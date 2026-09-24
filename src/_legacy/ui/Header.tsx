import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";

interface HeaderProps {
  title: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightText?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  timer?: string;
}

export const Header = ({
  title,
  leftIcon,
  onLeftPress,
  rightText,
  rightIcon,
  onRightPress,
  timer,
}: HeaderProps) => {
  return (
    <View style={styles.container}>
      {onLeftPress && (
        <TouchableOpacity onPress={onLeftPress} style={styles.button}>
          {leftIcon && (
            <Ionicons name={leftIcon} size={18} color={colors.text.primary} />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {timer && (
          <View style={styles.timerRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.brand.primary}
            />
            <Text style={styles.timerText}>{timer}</Text>
          </View>
        )}
      </View>

      {onRightPress ? (
        <TouchableOpacity onPress={onRightPress} style={styles.actionButton}>
          {rightIcon && (
            <Ionicons name={rightIcon} size={18} color={colors.text.primary} />
          )}
          {rightText && <Text style={styles.actionText}>{rightText}</Text>}
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: colors.ui.border,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  timerRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xxs,
    marginLeft: spacing.m,
  },
  timerText: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 10,
    gap: 4,
  },
  actionText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter",
  },
});
