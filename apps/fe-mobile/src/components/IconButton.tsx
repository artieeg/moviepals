import {
  ActivityIndicator,
  Pressable,
  TouchableOpacityProps,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";
import { twMerge } from "tailwind-merge";

export function IconButton({
  variant,
  children,
  loading,
  ...rest
}: TouchableOpacityProps & {
  variant: "primary" | "red" | "outline" | "gray";
  loading?: boolean;
}) {
  const scale = useSharedValue(1);

  const { colorScheme } = useColorScheme();

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
    <Pressable
      {...rest}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={loading}
    >
      <Animated.View
        style={rStyle}
        className={twMerge(
          "h-16 w-16 items-center justify-center rounded-full",
          variant === "primary" && "bg-brand-1",
          variant === "gray" && "bg-neutral-2-20 dark:bg-neutral-2-20",
          variant === "red" && "bg-red-1",
          //variant === "outline" && "border-neutral-3 border",
        )}
      >
        {loading ? (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <ActivityIndicator
              size="small"
              color={
                variant === "outline" || variant === "gray"
                  ? colorScheme === "dark"
                    ? "white"
                    : "black"
                  : "white"
              }
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            {children}
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}
