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
import { Button, Section, Switch } from "~/components";
import { useAdmob, useNavigation } from "~/hooks";
import {
  SCREEN_GENRE_FILTER,
  SCREEN_STREAMING_SERVICE_LIST,
  SCREEN_SWIPE,
} from "~/navigators/SwipeNavigator";
import { MainLayout } from "./layouts/MainLayout";

export function PrepareSwipeScreen() {
  const [quickMatchMode, setQuickMatchMode] = React.useState(true);

  useAdmob();

  const navigation = useNavigation();

  const genres = api.genres.fetchUserGenres.useQuery();

  const enabledGenres = useMemo(
    () => genres.data?.filter((g) => g.enabled),
    [genres.data],
  );

  function onStartSwiping() {
    navigation.navigate(SCREEN_SWIPE, { quickMatchMode });
  }

  return (
    <MainLayout title="movies">
      <View className="space-y-6 pb-3">
        <MyStreamingServicesSection />

        <GenreFilter />

        <CastFilter />

        <DirectorFilter />

        <QuickMatchMode
          enabled={quickMatchMode}
          onToggle={(v) => {
            setQuickMatchMode(v);
          }}
        />
      </View>

      <Button
        onPress={onStartSwiping}
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
    <Section
      title="quick match mode"
      subtitle="include friend movies even if they don't match your genre selection"
      {...rest}
      right={
        <View className="ml-4">
          <Switch enabled={enabled} onToggle={onToggle} />
        </View>
      }
    />
  );
}

function GenreFilter(props: TouchableOpacityProps) {
  const navigation = useNavigation();

  const enabledGenres = api.genres.fetchUserGenres.useQuery(undefined, {
    select: (data) => data?.filter((g) => g.enabled),
  });

  const enabledGenreCount = enabledGenres.data?.length ?? 0;

  function onPress() {
    navigation.navigate(SCREEN_GENRE_FILTER);
  }

  return (
    <Section
      title="genre filter"
      subtitle={
        enabledGenreCount > 0
          ? `${enabledGenres.data?.length} enabled genres`
          : "any genre"
      }
      showArrowRight
      onPress={onPress}
      {...props}
    />
  );
}

function MyStreamingServicesSection(props: TouchableOpacityProps) {
  const navigation = useNavigation();

  const user = api.user.getMyData.useQuery();

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
    <Section
      title="my streaming services"
      onPress={onPress}
      showArrowRight
      subtitle={
        streamingServices.data?.useAnyService ? (
          "using any service"
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
        )
      }
    />
  );
}

function CastFilter(props: TouchableOpacityProps) {
  return <Section title="cast filter" subtitle="coming soon" {...props} />;
}

function DirectorFilter(props: TouchableOpacityProps) {
  return <Section title="director filter" subtitle="coming soon" {...props} />;
}
