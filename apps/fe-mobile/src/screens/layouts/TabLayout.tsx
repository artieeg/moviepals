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

export function useTabLayoutScrollHandler() {
  const tweener = useSharedValue(0);

  const handler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tweener.value = event.contentOffset.y / 20;
    },
  });

  return { tweener, handler };
}

export function TabLayout({
  children,
  title,
  goBackCloseIcon,
  borderTweenerValue,
  subtitle,
  onGoBack,
  right,
  canGoBack,
  ...rest
}: {
  title: string;
  subtitle: string;
  onGoBack?: () => void;
  borderTweenerValue?: SharedValue<number>;
  right?: React.ReactNode;
  canGoBack?: boolean;
  goBackCloseIcon?: boolean;
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
      edges={{
        top: "additive",
        bottom: "maximum",
        left: "maximum",
        right: "maximum",
      }}
      className="flex-1 bg-white dark:bg-neutral-1 pt-3"
      {...rest}
    >
      <View className="flex-1 px-8">
        {/* HEADER */}
        <View className="space-y-2 pb-4">
          <Text className="font-primary-bold text-2xl text-neutral-1 dark:text-white">
            {title}
          </Text>
          <Text className="font-primary-regular text-base text-neutral-2 dark:text-neutral-5">
            {subtitle}
          </Text>
        </View>
        <Animated.View
          style={borderStyle}
          className="h-px -mx-8 bg-neutral-4 dark:bg-neutral-2-50"
        />

        {/* CONTENT */}
        <View className="flex-1 px-8">{children}</View>
      </View>
    </SafeAreaView>
  );
}
