import React from "react";
import { PressableProps } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AnimatedPressable } from "./AnimatedPressable";

export function TouchableScale(props: PressableProps) {
  const scale = useSharedValue(1);

  function onPressIn() {
    scale.value = withTiming(0.97);
  }

  function onPressOut() {
    scale.value = withTiming(1);
  }

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      style={[props.style, style]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    />
  );
}
