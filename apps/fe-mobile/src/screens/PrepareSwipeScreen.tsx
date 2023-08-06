import React, { useMemo } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";
import FastImage from "react-native-fast-image";
import { FlashList } from "@shopify/flash-list";
import { Check, NavArrowRight } from "iconoir-react-native";
import { produce } from "immer";
import { twMerge } from "tailwind-merge";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import { Checkbox, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_STREAMING_SERVICE_LIST } from "~/navigators/SwipeNavigator";
import { MainLayout } from "./layouts/MainLayout";

export function PrepareSwipeScreen() {
  const ctx = api.useContext();

  const genres = api.genres.fetchUserGenres.useQuery();
  const toggleGenre = api.genres.toggleGenre.useMutation({
    onMutate({ genre, enabled }) {
      ctx.genres.fetchUserGenres.setData(
        undefined,
        produce((data) => {
          const item = data?.find((g) => g.id === genre);

          if (!item) {
            return data;
          }

          item.enabled = enabled;
        }),
      );
    },
  });

  function onToggleGenre(id: number, enabled: boolean) {
    toggleGenre.mutate({ genre: id, enabled });
  }

  return (
    <MainLayout title="movies">
      <FlatList
        className="-mx-8 flex-1"
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 64 }}
        ListHeaderComponent={() => {
          return (
            <View className="space-y-6 pb-3">
              <MyStreamingServicesSection />
              <CastFilter />
              <DirectorFilter />
              <Text className="font-primary-bold text-neutral-1 text-xl">
                genres
              </Text>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <GenreItem
            onToggle={onToggleGenre}
            enabled={item.enabled}
            id={item.id}
            title={item.name}
            emoji={item.emoji}
          />
        )}
        data={genres.data}
      />
      <Button className="absolute bottom-0 left-8 right-8">
        start swiping
      </Button>
    </MainLayout>
  );
}

function Button({
  children,
  ...rest
}: TouchableOpacityProps & { children: string }) {
  return (
    <TouchableOpacity
      className="bg-brand-1 h-12 items-center justify-center rounded-full"
      {...rest}
    >
      <Text className="font-primary-bold text-base text-white">{children}</Text>
    </TouchableOpacity>
  );
}

function GenreItem({
  onToggle,
  id,
  title,
  emoji,
  enabled,
}: {
  onToggle: (id: any, enabled: boolean) => void;
  id: any;
  title: string;
  emoji: string;
  enabled: boolean;
}) {
  return (
    <ListItem
      itemId={id}
      icon={emoji}
      title={title}
      checkbox
      onToggle={onToggle}
      checked={enabled}
    />
  );
}

function MyStreamingServicesSection(props: TouchableOpacityProps) {
  const navigation = useNavigation();

  const user = api.user.getUserData.useQuery();

  const streamingServices = api.streaming_service.getStreamingServices.useQuery(
    { country: user.data?.country as string },
    {
      enabled: !!user.data?.country,
    },
  );

  const enabledStreamingServices = useMemo(
    () => streamingServices.data?.services.filter((service) => service.enabled),
    [streamingServices.data],
  );

  function onPress() {
    navigation.navigate(SCREEN_STREAMING_SERVICE_LIST);
  }

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      {...props}
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="font-primary-bold text-neutral-1 text-xl">
          my streaming services
        </Text>

        <View className="flex-row items-center">
          {streamingServices.data?.useAnyService ? (
            <Text className="font-primary-regular text-neutral-2 text-base">
              using any service
            </Text>
          ) : (
            <View className="mt-2">
              <FlashList
                horizontal
                ItemSeparatorComponent={() => <View className="w-2" />}
                data={streamingServices.data?.services}
                renderItem={({ item }) => {
                  return (
                    <FastImage
                      resizeMode="contain"
                      source={{
                        uri: getTMDBStaticUrl(item.logo_path),
                      }}
                      className="h-8 w-8 rounded-lg"
                    />
                  );
                }}
              />
            </View>
          )}
        </View>
      </View>
      <NavArrowRight />
    </TouchableOpacity>
  );
}

function CastFilter(props: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      {...props}
    >
      <View>
        <Text className="font-primary-bold text-neutral-1 text-xl">
          cast filter
        </Text>

        <View className="h-6 flex-row items-center space-x-1">
          <Text className="font-primary-regular text-neutral-2 text-base">
            coming soon
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DirectorFilter(props: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      {...props}
    >
      <View>
        <Text className="font-primary-bold text-neutral-1 text-xl">
          director filter
        </Text>

        <View className="h-6 flex-row items-center space-x-1">
          <Text className="font-primary-regular text-neutral-2 text-base">
            coming soon
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
