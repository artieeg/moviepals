import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { twJoin } from "tailwind-merge";

export function Button({
  children,
  kind = "primary",
  ...rest
}: TouchableOpacityProps & { children: string; kind?: "primary" | "outline" }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={twJoin(
        "h-12 items-center justify-center rounded-full",
        kind !== "outline" && rest.disabled ? "bg-neutral-4" : "bg-brand-1",
        kind === "outline" && "border-brand-1 border bg-transparent",
      )}
      {...rest}
    >
      <Text
        className={twJoin(
          "font-primary-bold text-base",
          kind === "outline" ? "text-brand-1" : "text-white",
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
