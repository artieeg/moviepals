import React, { useEffect } from "react";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AnimatedTouchableOpacity } from "./AnimatedTouchableOpacity";

export function Switch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}) {
  const tweener = useSharedValue(enabled ? 1 : 0);

  useEffect(() => {
    tweener.value = withTiming(enabled ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.75, 0.04, 0.32, 1).factory(),
    });
  }, [enabled]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        tweener.value,
        [0.3, 1],
        ["#C7C5DA", "#6356E4"],
      ),
      backgroundColor: interpolateColor(
        tweener.value,
        [0.3, 1],
        ["#E0E0E0", "#6867AA"],
      ),
    };
  });

  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: 24 * tweener.value,
        },
        { scaleY: interpolate(tweener.value, [0, 0.5, 1], [1, 0.7, 1]) },
      ],
    };
  });

  return (
    <AnimatedTouchableOpacity
      onPress={() => onToggle(!enabled)}
      activeOpacity={1}
      style={backdropStyle}
      className="max-w-14 h-8 w-14 justify-center rounded-full border"
    >
      <Animated.View
        style={circleStyle}
        className="h-7 w-7 rounded-full bg-white"
      ></Animated.View>
    </AnimatedTouchableOpacity>
  );
}
