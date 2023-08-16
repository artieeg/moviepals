import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { NavArrowRight } from "iconoir-react-native";
import { twJoin } from "tailwind-merge";

export function Section({
  title,
  subtitle,
  showArrowRight,
  right,
  danger,
  ...rest
}: TouchableOpacityProps & {
  title: string;
  subtitle: string | React.ReactNode;
  showArrowRight?: boolean;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      {...rest}
    >
      <View className="flex-1">
        <Text
          className={twJoin(
            "font-primary-bold text-neutral-1 text-xl",
            danger && "text-red-1",
          )}
        >
          {title}
        </Text>

        <View className="flex-row items-center">
          {typeof subtitle === "string" ? (
            <Text className="font-primary-regular text-neutral-2 text-base">
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </View>
      </View>

      {showArrowRight && !right && <NavArrowRight />}
      {right}
    </TouchableOpacity>
  );
}