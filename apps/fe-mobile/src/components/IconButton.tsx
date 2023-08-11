import { Pressable, TouchableOpacityProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

export function IconButton({
  variant,
  children,
  ...rest
}: TouchableOpacityProps & { variant: "primary" | "red" | "outline" }) {
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
          "h-16 w-16 items-center justify-center rounded-full",
          variant === "primary" && "bg-brand-1",
          variant === "red" && "bg-red-1",
          variant === "outline" && "border-neutral-3 border",
        )}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
