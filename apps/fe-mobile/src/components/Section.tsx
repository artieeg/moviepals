import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { NavArrowRight } from "iconoir-react-native";
import { twJoin } from "tailwind-merge";

export type SectionProps = TouchableOpacityProps & {
  title: string;
  subtitle: string | React.ReactNode;
  showArrowRight?: boolean;
  right?: React.ReactNode;
  danger?: boolean;
};

export function Section({
  title,
  subtitle,
  showArrowRight,
  right,
  danger,
  ...rest
}: SectionProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="flex-row items-center justify-between"
      {...rest}
    >
      <View className="flex-1 space-y-1">
        <Text
          className={twJoin(
            "font-primary-bold text-neutral-1 dark:text-white text-xl",
            danger && "text-red-1",
          )}
        >
          {title}
        </Text>

        <View className="flex-row items-center">
          {typeof subtitle === "string" ? (
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
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
