import { Alert, Pressable, TouchableOpacityProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";
import { AnimatedTouchableOpacity } from "./AnimatedTouchableOpacity";

export function IconButton({
  variant,
  children,
  ...rest
}: TouchableOpacityProps & { variant: "like" | "dislike" | "outline" }) {
  const scale = useSharedValue(1);

  function onPressIn() {
    scale.value = withTiming(0.97, { duration: 100 });
  }

  function onPressOut() {
    scale.value = withTiming(1, { duration: 100 });
  }

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  }, []);

  return (
    <Pressable {...rest} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={rStyle}
        className={twMerge(
          "w-16 h-16 rounded-full items-center justify-center",
          variant === "like" && "bg-brand-1",
          variant === "dislike" && "bg-red-1",
          variant === "outline" && "border border-neutral-3"
        )}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
