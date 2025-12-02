import React from "react";
import { useForm } from "react-hook-form";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAuthActions } from "../../hooks/useAuthActionts";
import { colors } from "../../theme/colors";
import { AppButton } from "../ui/AppButton";
import { ControlledAppInput } from "../ui/ControlledAppInput";

export const LoginForm = () => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { handleGoogleSignIn, handleSignInWithEmailAndPassword } =
    useAuthActions();
  return (
    <View style={styles.loginSection}>
      <ControlledAppInput
        control={control}
        name="email"
        placeholder="Enter your Mail Address"
        label="Email Address"
        containerStyle={styles.inputContainerStyle}
      />
      <ControlledAppInput
        control={control}
        name="password"
        label="Password"
        containerStyle={styles.inputContainerStyle}
        placeholder="Enter your password"
        secureTextEntry
      />
      <Text style={styles.forgetPasswordText}>Forgot your Password?</Text>
      <AppButton
        title="Login"
        containerStyle={{ backgroundColor: colors.brand.primary }}
        onPress={handleSubmit((data) =>
          handleSignInWithEmailAndPassword(data.email, data.password)
        )}
      />
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.otherLogin}>Or login with</Text>
        <View style={styles.dividerLine} />
      </View>
      <AppButton
        title="Login with Google"
        onPress={handleGoogleSignIn}
        containerStyle={styles.googleLoginButton}
        icon={
          <Image
            style={styles.icon}
            source={require("../../../assets/icon.png")}
          />
        }
      />
      <AppButton
        title="Login with Apple"
        containerStyle={styles.appleLoginButton}
        icon={
          <Image
            source={require("../../../assets/icon.png")}
            style={styles.icon}
          />
        }
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loginSection: {
    width: "100%",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  inputContainerStyle: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ui.border,
  },
  forgetPasswordText: {
    color: colors.brand.primary,
    fontSize: 14,
    fontFamily: "Inter",
    textAlign: "right",
    marginBottom: 12,
  },
  otherLogin: {
    textAlign: "center",
    color: colors.text.tertiary,
    fontSize: 14,
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  googleLoginButton: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.ui.border,
    gap: 8,
    height: 48,
  },
  appleLoginButton: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.ui.border,
    gap: 8,
    height: 48,
    paddingRight: 12,
  },
});
