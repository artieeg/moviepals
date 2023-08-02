import React, { PropsWithChildren } from "react";
import {
  FlatList,
  Text,
  Touchable,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, NavArrowRight } from "iconoir-react-native";
import { produce } from "immer";
import { twJoin, twMerge } from "tailwind-merge";

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
        })
      );
    },
  });

  function onToggleGenre(id: number, enabled: boolean) {
    toggleGenre.mutate({ genre: id, enabled });
  }

  return (
    <MainLayout>
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
      <Button className="absolute bottom-0 left-0 right-0">
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
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(id, !enabled)}
      className="flex-row items-center justify-between"
    >
      <View className="flex-row items-center space-x-3">
        <View className="bg-neutral-2-10 h-16 w-16 items-center justify-center rounded-full">
          <Text className="text-3.5xl">{emoji}</Text>
        </View>
        <Text className="font-primary-bold text-neutral-1 text-xl">
          {title}
        </Text>
      </View>
      <Checkbox checked={enabled} onToggle={() => onToggle(id, !enabled)} />
    </TouchableOpacity>
  );
}

function Checkbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(!checked)}
      className={twMerge(
        "border-neutral-4 h-6 w-6 items-center justify-center rounded-lg border bg-white",
        checked ? "bg-brand-1 border-brand-1" : "border-neutral-4 bg-white"
      )}
    >
      {checked && (
        <Check strokeWidth={4} width="16" height="16" color="white" />
      )}
    </TouchableOpacity>
  );
}

function MyStreamingServicesSection(props: TouchableOpacityProps) {
  const navigation = useNavigation();

  const streamingServices =
    api.streaming_service.getStreamingServices.useQuery();

  function onPress() {
    //navigation.navigate
  }

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      {...props}
      onPress={onPress}
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
