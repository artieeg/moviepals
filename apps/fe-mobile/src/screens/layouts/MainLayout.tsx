import { PropsWithChildren } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cancel, NavArrowLeft } from "iconoir-react-native";

import { useNavigation } from "~/hooks";

export function MainLayout({
  children,
  title,
  goBackCloseIcon,
  onGoBack,
  right,
  canGoBack,
  edges,
}: PropsWithChildren & {
  title: string;
  /** Override default "go back" behavior */
  onGoBack?: () => void;
  right?: React.ReactNode;
  canGoBack?: boolean;
  goBackCloseIcon?: boolean;
  edges?: ("top" | "left" | "right" | "bottom")[];
}) {
  const navigation = useNavigation();

  function _onGoBack() {
    if (onGoBack) {
      onGoBack();
    } else {
      navigation.goBack();
    }
  }

  return (
    <SafeAreaView
      edges={edges ?? ["top", "left", "right", "bottom"]}
      className="flex-1 bg-white dark:bg-neutral-1"
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
        </View>

        {/* CONTENT */}
        <View className="flex-1 px-8">{children}</View>
      </View>
    </SafeAreaView>
  );
}
