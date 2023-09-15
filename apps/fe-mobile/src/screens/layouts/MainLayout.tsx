import { PropsWithChildren } from "react";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { Cancel, NavArrowLeft } from "iconoir-react-native";

import { useNavigation } from "~/hooks";

export function useMainLayoutScrollHandler() {
  const tweener = useSharedValue(0);

  const handler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tweener.value = event.contentOffset.y / 20;
    },
  });

  return { tweener, handler };
}

export function MainLayout({
  children,
  title,
  goBackCloseIcon,
  borderTweenerValue,
  onGoBack,
  right,
  canGoBack,
  edges,
  ...rest
}: {
  title: string;
  /** Override default "go back" behavior */
  onGoBack?: () => void;
  borderTweenerValue?: SharedValue<number>;
  right?: React.ReactNode;
  canGoBack?: boolean;
  goBackCloseIcon?: boolean;
  edges?: SafeAreaViewProps["edges"];
} & ViewProps) {
  const navigation = useNavigation();

  function _onGoBack() {
    if (onGoBack) {
      onGoBack();
    } else {
      navigation.goBack();
    }
  }

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderTweenerValue ? borderTweenerValue.value : 0,
  }));

  return (
    <SafeAreaView
      edges={edges ?? ["top", "left", "right", "bottom"]}
      className="flex-1 bg-white dark:bg-neutral-1"
      {...rest}
    >
      <View className="flex-1">
        {/* HEADER */}
        <View className="flex-row items-center justify-center">
          {canGoBack && (
            <TouchableOpacity onPress={_onGoBack} className="absolute left-6">
              {goBackCloseIcon ? <Cancel /> : <NavArrowLeft />}
            </TouchableOpacity>
          )}
          <View className="flex-row items-center justify-center py-4">
            <Text className="font-primary-bold text-neutral-1 dark:text-white text-base">
              {title}
            </Text>
          </View>

          {right && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              className="absolute right-6"
            >
              {right}
            </Animated.View>
          )}

          {/* Border */}
        </View>
        <Animated.View style={borderStyle} className="h-px bg-neutral-4 dark:bg-neutral-2-50" />

        {/* CONTENT */}
        <View className="flex-1 px-8">{children}</View>
      </View>
    </SafeAreaView>
  );
}
