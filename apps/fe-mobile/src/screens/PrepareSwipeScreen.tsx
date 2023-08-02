import React, { PropsWithChildren } from "react";
import {
  FlatList,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
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
      <FlatList
        className="flex-1"
        ListHeaderComponent={() => {
          return (
            <View className="space-y-6 pb-3">
              <MyStreamingServicesSection />
              <Text className="font-primary-bold text-neutral-1 text-xl">
                genres
              </Text>
            </View>
          );
        }}
        renderItem={() => (
          <GenreItem
            onToggle={() => {}}
            id="adventure"
            title="adventure"
            emoji="🌍"
          />
        )}
        data={[""]}
      />
    </MainLayout>
  );
}

function GenreItem({
  onToggle,
  id,
  title,
  emoji,
}: {
  onToggle: () => void;
  id: string;
  title: string;
  emoji: string;
}) {
  return (
    <TouchableOpacity className="flex-row items-center justify-between">
      <View className="flex-row items-center space-x-3">
        <View className="bg-neutral-2-10 h-16 w-16 items-center justify-center rounded-full">
          <Text className="text-3.5xl">{emoji}</Text>
        </View>
        <Text className="font-primary-bold text-neutral-1 text-xl">
          {title}
        </Text>
      </View>
      <Checkbox />
    </TouchableOpacity>
  );
}

function Checkbox() {
  return (
    <TouchableOpacity className="border-neutral-4 h-6 w-6 rounded-lg border bg-white"></TouchableOpacity>
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

        <View className="h-6 flex-row items-center space-x-1">
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
