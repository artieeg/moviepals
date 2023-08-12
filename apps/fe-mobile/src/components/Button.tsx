import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { twJoin } from "tailwind-merge";

export function Button({
  children,
  ...rest
}: TouchableOpacityProps & { children: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={twJoin(
        "h-12 items-center justify-center rounded-full",
        rest.disabled ? "bg-neutral-4" : "bg-brand-1",
      )}
      {...rest}
    >
      <Text className="font-primary-bold text-base text-white">{children}</Text>
    </TouchableOpacity>
  );
}
