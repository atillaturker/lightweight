import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme/colors";

export const RegisterForm = () => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.labelText}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.labelText}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.labelText}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: colors.background.tertiary,
    color: "#6B7281",
    fontSize: 16,
    fontFamily: "Inter",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.ui.border,
  },
  labelText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
    marginBottom: 8,
  },
  inputText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: colors.brand.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
  },
});
