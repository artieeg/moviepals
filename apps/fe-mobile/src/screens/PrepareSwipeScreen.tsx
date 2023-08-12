import React, { useMemo } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { NavArrowRight } from "iconoir-react-native";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import { Button, Switch } from "~/components";
import { useNavigation } from "~/hooks";
import {
  SCREEN_GENRE_FILTER,
  SCREEN_STREAMING_SERVICE_LIST,
  SCREEN_SWIPE,
} from "~/navigators/SwipeNavigator";
import { MainLayout } from "./layouts/MainLayout";

export function PrepareSwipeScreen() {
  const [quickMatch, setQuickMatch] = React.useState(true);

  const navigation = useNavigation();
  const ctx = api.useContext();

  const genres = api.genres.fetchUserGenres.useQuery();

  const enabledGenres = useMemo(
    () => genres.data?.filter((g) => g.enabled),
    [genres.data],
  );

  function onStartSwiping() {
    navigation.navigate(SCREEN_SWIPE);
  }

  return (
    <MainLayout title="movies">
      <View className="space-y-6 pb-3">
        <MyStreamingServicesSection />

        <GenreFilter />

        <CastFilter />

        <DirectorFilter />

        <QuickMatchMode
          enabled={quickMatch}
          onToggle={(v) => {
            setQuickMatch(v);
          }}
        />
      </View>

      <Button
        onPress={onStartSwiping}
        disabled={enabledGenres?.length === 0}
        className="absolute bottom-0 left-8 right-8"
      >
        start swiping
      </Button>
    </MainLayout>
  );
}

function QuickMatchMode({
  enabled,
  onToggle,
  ...rest
}: {
  enabled: boolean;
  onToggle(enabled: boolean): void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      {...rest}
    >
      <View className="flex-1">
        <Text className="font-primary-bold text-neutral-1 text-xl">
          quick match mode
        </Text>

        <View className="flex-row items-center">
          <Text className="font-primary-regular text-neutral-2 text-base">
            include friend movies even if they don't match your filters
          </Text>
        </View>
      </View>

      <View className="w-14">
        <Switch enabled={enabled} onToggle={onToggle} />
      </View>
    </TouchableOpacity>
  );
}

function GenreFilter(props: TouchableOpacityProps) {
  const navigation = useNavigation();

  const enabledGenres = api.genres.fetchUserGenres.useQuery(undefined, {
    select: (data) => data?.filter((g) => g.enabled),
  });

  function onPress() {
    navigation.navigate(SCREEN_GENRE_FILTER);
  }

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      {...props}
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="font-primary-bold text-neutral-1 text-xl">
          genre filter
        </Text>

        <View className="flex-row items-center">
          <Text className="font-primary-regular text-neutral-2 text-base">
            {enabledGenres.data
              ? `${enabledGenres.data.length} enabled genres`
              : "any genre"}
          </Text>
        </View>
      </View>
      <NavArrowRight />
    </TouchableOpacity>
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
              <FlatList
                horizontal
                ItemSeparatorComponent={() => <View className="w-2" />}
                data={enabledStreamingServices}
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
