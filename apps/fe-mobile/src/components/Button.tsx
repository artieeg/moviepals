import React, { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useColorScheme } from "nativewind";
import { twJoin } from "tailwind-merge";

import { TouchableScale } from "./TouchableScale";

export type ButtonProps = PropsWithChildren<
  TouchableOpacityProps & {
    kind?: "primary" | "outline" | "text";
    isLoading?: boolean;
  }
>;

export function Button({
  children,
  isLoading,
  kind = "primary",
  ...rest
}: ButtonProps) {
  const { colorScheme } = useColorScheme();

  return (
    <TouchableScale
      disabled={rest.disabled || isLoading}
      className={twJoin(
        "h-12 items-center justify-center rounded-lg",
        kind === "primary" && "bg-brand-1",
        rest.disabled && "bg-neutral-4",
        kind === "outline" && "border-brand-1 border bg-transparent",
      )}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            kind === "outline"
              ? colorScheme === "dark"
                ? "white"
                : "black"
              : "white"
          }
        />
      ) : (
        <Text
          className={twJoin(
            "font-primary-bold text-base",
            (kind === "outline" || kind === "text") && "text-brand-1",
            kind === "primary" && "text-white",
          )}
        >
          {children}
        </Text>
      )}
    </TouchableScale>
  );
}
