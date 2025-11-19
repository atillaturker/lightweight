import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const RegisterForm = () => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.labelText}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={colors.placeHolderTextColor}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.labelText}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={colors.placeHolderTextColor}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.labelText}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          placeholderTextColor={colors.placeHolderTextColor}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const colors = {
  backgroundColor: "#101922",
  textColor: "#FFFFFF",
  placeHolderColor: "#1F2937",
  sectionText: "#1D5DB",
  placeHolderTextColor: "#9CA3AF",
  inputBackgroundColor: "#18212D",
  buttonBackgroundColor: "#137FEC",
  forgetPasswordTextColor: "#137FEC",
  dividerColor: "#374151",
  borderColor: "#374151",
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
    backgroundColor: colors.inputBackgroundColor,
    color: "#6B7281",
    fontSize: 16,
    fontFamily: "Inter",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.borderColor,
  },
  labelText: {
    color: colors.textColor,
    fontSize: 16,
    fontFamily: "Inter",
    marginBottom: 8,
  },
  inputText: {
    color: colors.textColor,
    fontSize: 16,
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: colors.buttonBackgroundColor,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  buttonText: {
    color: colors.textColor,
    fontSize: 16,
    fontFamily: "Inter",
  },
  forgetPasswordText: {
    color: colors.forgetPasswordTextColor,
    fontSize: 14,
    fontFamily: "Inter",
    marginTop: 16,
    textAlign: "right",
  },
});
