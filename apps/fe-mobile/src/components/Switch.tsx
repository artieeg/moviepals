import React, { useEffect } from "react";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";

import { PRIMARY_COLOR, WHITE_COLOR } from "~/utils/consts";
import { AnimatedTouchableOpacity } from "./AnimatedTouchableOpacity";

function useThemedColors() {
  const { colorScheme } = useColorScheme();

  if (colorScheme === "light") {
    return {
      borderColor: ["#C7C5DA", PRIMARY_COLOR],
      backgroundColor: ["#E0E0E0", PRIMARY_COLOR],
      circleColor: [WHITE_COLOR, WHITE_COLOR],
    };
  } else {
    return {
      borderColor: ["#52525b", PRIMARY_COLOR],
      backgroundColor: ["#27272a", PRIMARY_COLOR],
      circleColor: ["#9CA3AF", WHITE_COLOR],
    };
  }
}

export function Switch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}) {
  const tweener = useSharedValue(enabled ? 1 : 0);

  const { borderColor, circleColor, backgroundColor } = useThemedColors();

  useEffect(() => {
    tweener.value = withTiming(enabled ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.75, 0.04, 0.32, 1).factory(),
    });
  }, [enabled]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(tweener.value, [0.3, 1], borderColor),
      backgroundColor: interpolateColor(
        tweener.value,
        [0.3, 1],
        backgroundColor,
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
      backgroundColor: interpolateColor(tweener.value, [0.3, 1], circleColor),
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
        className="h-7 w-7 rounded-full"
      ></Animated.View>
    </AnimatedTouchableOpacity>
  );
}
