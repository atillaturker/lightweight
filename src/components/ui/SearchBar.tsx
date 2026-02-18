import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../theme";

interface SearchBarProps {
  placeholder?: string;
  style?: ViewStyle;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const SearchBar = ({
  placeholder = "Search...",
  style,
  value,
  onChangeText,
}: SearchBarProps) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="search"
        size={20}
        color={colors.text.tertiary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    height: 48,
  },
  icon: {
    marginRight: spacing.s,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
  },
});
