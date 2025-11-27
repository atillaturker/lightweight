import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const AppButton = ({
  title,
  isLoading,
  icon,
  containerStyle,
  ...props
}: AppButtonProps) => {
  return (
    <TouchableOpacity style={[styles.button, containerStyle]} {...props}>
      {icon}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
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
