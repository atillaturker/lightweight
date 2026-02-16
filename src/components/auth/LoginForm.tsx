import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAuthActions } from "../../hooks/useAuthActionts";
import { LoginFormData, loginSchema } from "../../schemas/authScemas";
import { useAppSelector } from "../../store";
import { spacing } from "../../theme";
import { colors } from "../../theme/colors";
import { AppButton } from "../ui/AppButton";
import { ControlledAppInput } from "../ui/ControlledAppInput";

export const LoginForm = () => {
  const { handleSubmit, control } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { handleGoogleSignIn, handleSignInWithEmailAndPassword } =
    useAuthActions();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);
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
      {error && <Text style={styles.errorText}>{error}</Text>}
      <AppButton
        title="Login"
        isLoading={isLoading}
        containerStyle={{ backgroundColor: colors.brand.primary }}
        onPress={handleSubmit(
          (data) => handleSignInWithEmailAndPassword(data.email, data.password),
          (errors) => console.log(errors),
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
        containerStyle={styles.loginButton}
        icon={
          <Image
            style={styles.icon}
            source={require("../../../assets/icon.png")}
          />
        }
      />
      <AppButton
        title="Login with Apple"
        containerStyle={[styles.loginButton, { paddingRight: spacing.s }]}
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
    paddingLeft: spacing.s,
  },
  inputContainerStyle: {
    paddingBottom: spacing.xl,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xl,
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
    paddingBottom: spacing.m,
  },
  otherLogin: {
    textAlign: "center",
    color: colors.text.tertiary,
    fontSize: 14,
    fontFamily: "Inter",
    paddingHorizontal: spacing.m,
  },
  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    paddingBottom: spacing.xxs,
    borderColor: colors.ui.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    gap: 12,
    marginTop: spacing.m,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.s,
    marginTop: spacing.s,
  },
});
