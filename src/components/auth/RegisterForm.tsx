import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { AppButton } from "../ui/AppButton";
import { AppInput } from "../ui/AppInput";

export const RegisterForm = () => {
  return (
    <View style={styles.container}>
      <AppInput
        label="Email Address"
        containerStyle={styles.inputContainerStyle}
        placeholder="Enter your email"
        placeholderTextColor={colors.text.tertiary}
      />
      <AppInput
        label="Password"
        containerStyle={styles.inputContainerStyle}
        placeholder="Enter your password"
        placeholderTextColor={colors.text.tertiary}
        secureTextEntry
      />
      <AppInput
        label="Confirm Password"
        containerStyle={styles.inputContainerStyle}
        placeholder="Confirm your password"
        placeholderTextColor={colors.text.tertiary}
        secureTextEntry
      />
      <AppButton
        title="Create Account"
        containerStyle={{ backgroundColor: colors.brand.primary }}
        onPress={() => {}}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainerStyle: {
    marginBottom: 20,
  },
});
