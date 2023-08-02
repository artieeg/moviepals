import React, { PropsWithChildren } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavArrowRight } from "iconoir-react-native";

import { api } from "~/utils/api";
import { useNavigation } from "~/hooks";

function MainLayout({ children }: PropsWithChildren) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-white">
      <View className="flex-1 px-8">
        {/* HEADER */}
        <View className="flex-row items-center justify-center py-4">
          <Text className="font-primary-bold text-neutral-1 text-2xl">
            movies
          </Text>
        </View>

        {/* CONTENT */}
        <View className="flex-1">{children}</View>
      </View>
    </SafeAreaView>
  );
}

export function PrepareSwipeScreen() {
  return (
    <MainLayout>
      <MyStreamingServicesSection />
    </MainLayout>
  );
}

function MyStreamingServicesSection() {
  const navigation = useNavigation();

  const streamingServices =
    api.streaming_service.getStreamingServices.useQuery();

  function onPress() {
    //navigation.navigate
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between"
    >
      <View>
        <Text className="font-primary-bold text-neutral-1 text-xl">
          my streaming services
        </Text>

        <View className="h-6 flex-row items-center">
          {streamingServices.data?.useAnyService ? (
            <Text className="font-primary-regular text-neutral-2 text-base">
              using any service
            </Text>
          ) : (
            streamingServices.data?.services.map((service) => (
              <FastImage
                resizeMode="contain"
                source={{
                  uri: service.image,
                }}
                className="h-8 w-8 rounded-lg"
              />
            ))
          )}
        </View>
      </View>
      <NavArrowRight />
    </TouchableOpacity>
  );
}
