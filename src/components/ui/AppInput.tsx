import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

interface AppInput extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const AppInput = ({
  label,
  error,
  style,
  containerStyle,
  ...props
}: AppInput) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.labelText}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.text.secondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default AppInput;

const styles = StyleSheet.create({
  container: {},
  input: {
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: colors.background.tertiary,
    color: colors.text.tertiary,
    fontSize: 16,
    fontFamily: "Inter",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.ui.border,
  },
  inputError: {},
  labelText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
    marginBottom: 6,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: 16,
    fontFamily: "Inter",
    marginTop: 4,
  },
});
