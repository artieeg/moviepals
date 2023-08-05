import {ArrowLeft, NavArrowLeft} from "iconoir-react-native";
import { PropsWithChildren } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function MainLayout({
  children,
  title,
  canGoBack,
}: PropsWithChildren & { title: string; canGoBack?: boolean }) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-white">
      <View className="flex-1">
        {/* HEADER */}
        <View className="flex-row items-center justify-center">
          <TouchableOpacity className="absolute left-6">
            <NavArrowLeft />
          </TouchableOpacity>
        <View className="flex-row items-center justify-center py-4">
          <Text className="font-primary-bold text-neutral-1 text-2xl">
            {title}
          </Text>
        </View>
        </View>

        {/* CONTENT */}
        <View className="flex-1 px-8">{children}</View>
      </View>
    </SafeAreaView>
  );
}
