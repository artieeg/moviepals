import React, { PropsWithChildren } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { twJoin } from "tailwind-merge";

import { TouchableScale } from "./TouchableScale";

export type ButtonProps = PropsWithChildren<
  TouchableOpacityProps & { kind?: "primary" | "outline" | "text" }
>;

export function Button({ children, kind = "primary", ...rest }: ButtonProps) {
  return (
    <TouchableScale
      className={twJoin(
        "h-12 items-center justify-center rounded-full",
        kind === "primary" && "bg-brand-1",
        rest.disabled && "bg-neutral-4",
        kind === "outline" && "border-brand-1 border bg-transparent",
      )}
      {...rest}
    >
      <Text
        className={twJoin(
          "font-primary-bold text-base",
          (kind === "outline" || kind === "text") && "text-brand-1",
          kind === "primary" && "text-white",
        )}
      >
        {children}
      </Text>
    </TouchableScale>
  );
}
