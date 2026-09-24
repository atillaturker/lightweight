import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { TextInputProps } from "react-native";
import { AppInput } from "./AppInput";

export interface ControlledAppInputProps<T extends FieldValues>
  extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  containerStyle?: object;
}

export const ControlledAppInput = <T extends FieldValues>({
  control,
  name,
  label,
  containerStyle,
  ...props
}: ControlledAppInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onBlur, onChange, value },
        formState: { errors },
      }) => {
        return (
          <AppInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            label={label}
            containerStyle={containerStyle}
            error={errors?.[name]?.message as string}
            {...props}
          />
        );
      }}
    />
  );
};
