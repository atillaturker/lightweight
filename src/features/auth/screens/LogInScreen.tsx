/**
 * Log-in screen.
 *
 * Shares the sign-up layout: back header, headline, email / password
 * fields, a forgot-password text action, one primary CTA, an "or" divider,
 * provider buttons, and the account switch row. The CTA is disabled until
 * both fields are valid, so no invalid request is ever sent.
 */
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";

import type { AuthStackParamList } from "@/app/navigation/types";
import { AppleGlyph, AuthDivider, EyeIcon, GoogleGlyph } from "../components";
import { useSignInActions } from "../hooks/useSignInActions";
import { useAuthStore } from "../store/authStore";
import { styles } from "./authScreen.styles";

/** Validation schema for the log-in form. */
const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LogInForm = z.infer<typeof logInSchema>;

/** Initial (empty) form values. */
const EMPTY_LOG_IN: LogInForm = { email: "", password: "" };

/**
 * Sign-in screen. `useSignInActions` owns the request; this screen only
 * renders loading and error state from the auth store.
 */
export function LogInScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "LogIn">): React.ReactElement {
  const { signInEmail, signInGoogle, signInApple } = useSignInActions();
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LogInForm>({
    resolver: zodResolver(logInSchema),
    defaultValues: EMPTY_LOG_IN,
    mode: "onChange",
  });

  const values = watch();
  const loading = status === "loading";

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader showBack onBack={navigation.goBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headline}>Welcome</Text>
        <Text style={styles.supporting}>
          Log in to continue where you left off.
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
            keyboardType="email-address"
            onChangeText={(value) =>
              setValue("email", value, { shouldValidate: true })
            }
            testID="login-email"
            value={values.email}
          />

          <View style={styles.fieldGap}>
            <Input
              label="Password"
              placeholder="••••••••"
              autoCapitalize="none"
              autoComplete="current-password"
              error={errors.password?.message}
              onChangeText={(value) =>
                setValue("password", value, { shouldValidate: true })
              }
              rightAccessory={
                <Pressable
                  accessibilityLabel={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  accessibilityRole="button"
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  testID="login-password-toggle"
                >
                  <EyeIcon hidden={!passwordVisible} />
                </Pressable>
              }
              secureTextEntry={!passwordVisible}
              testID="login-password"
              value={values.password}
            />
          </View>

          <View style={styles.fieldAction}>
            <Text
              accessibilityRole="link"
              onPress={() => {
                // Password reset is handled server-side in a later task.
              }}
              style={styles.switchAction}
            >
              Forgot password?
            </Text>
          </View>
        </View>

        {authError ? <Text style={styles.inlineError}>{authError}</Text> : null}

        <View style={styles.cta}>
          <Button
            fullWidth
            label="Log in"
            loading={loading}
            onPress={handleSubmit(
              (form) =>
                void signInEmail({
                  email: form.email,
                  password: form.password,
                }),
            )}
            testID="login-submit"
          />
        </View>

        <View style={styles.divider}>
          <AuthDivider />
        </View>

        <View style={styles.providerGap}>
          <Button
            fullWidth
            icon={<GoogleGlyph />}
            label="Continue with Google"
            onPress={() => void signInGoogle()}
            variant="secondary"
          />
        </View>

        <View style={styles.providers}>
          <Button
            fullWidth
            icon={<AppleGlyph />}
            label="Continue with Apple"
            onPress={() => void signInApple()}
            variant="secondary"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            Don&apos;t have an account?{" "}
            <Text
              accessibilityRole="link"
              onPress={() => navigation.navigate("SignUp")}
              style={styles.switchAction}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
