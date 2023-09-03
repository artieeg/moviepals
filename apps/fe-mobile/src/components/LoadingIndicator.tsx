import React from "react";
import { ActivityIndicator } from "react-native";
import { useColorScheme } from "nativewind";

export function LoadingIndicator() {
  const { colorScheme } = useColorScheme();

  return (
    <ActivityIndicator
      size="large"
      color={colorScheme === "dark" ? "white" : "black"}
    />
  );
}
