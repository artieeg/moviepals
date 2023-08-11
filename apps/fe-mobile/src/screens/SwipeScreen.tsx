import React from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { PanGestureHandler } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { api, RouterOutputs } from "~/utils/api";
import { MainLayout } from "./layouts/MainLayout";

export function SwipeScreen() {
  const user = api.user.getUserData.useQuery();
  const genres = api.genres.fetchUserGenres.useQuery(undefined, {
    select: (data) =>
      data?.filter((genre) => genre.enabled).map((genre) => genre.id),
  });

  const watchProviders = api.streaming_service.getStreamingServices.useQuery(
    {
      country: user.data!.country,
    },
    {
      select: (data) =>
        data.services
          .filter((s) => s.enabled)
          .map((service) => service.provider_id),
    },
  );

  const result = api.movie_feed.getMovieFeed.useInfiniteQuery(
    {
      genres: genres.data!,
      watchProviderIds: watchProviders.data!,
      region: user.data!.country,
    },
    {
      initialCursor: 0,
      getNextPageParam: (latestResponse) => latestResponse.cursor,
    },
  );

  return (
    <MainLayout title="swipe" canGoBack>
      {result.isSuccess && (
        <MovieCard
          movie={result.data.pages[result.data.pages.length - 1].feed[0]}
        />
      )}
    </MainLayout>
  );
}

function MovieCard({
  movie,
}: {
  movie: RouterOutputs["movie_feed"]["getMovieFeed"]["feed"][number];
}) {
  const { width, height } = useWindowDimensions();
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const handler = useAnimatedGestureHandler({
    onStart() {},
    onActive(event) {
      tx.value = event.translationX;
      ty.value = event.translationY;
    },
    onEnd() {
      tx.value = withSpring(0);
      ty.value = withSpring(0);
    },
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tx.value,
        },
        {
          translateY: ty.value,
        },
        { rotate: `${tx.value / 15}deg` },
      ],
    };
  }, []);

  return (
    <PanGestureHandler onGestureEvent={handler}>
      <Animated.View style={style} className="aspect-[2/3]">
        <View className="rounded-4xl flex-1 overflow-hidden">
          <FastImage
            resizeMode="cover"
            className="flex-1"
            source={{ uri: movie.poster_path }}
          />
          <View className="absolute bottom-0 left-0 right-0 top-0 justify-end ">
            <LinearGradient
              colors={["#000000FF", "#00000000"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0.6 }}
              className="absolute bottom-0 left-0 right-0 top-0"
            />
            <View className="space-y-3 p-4">
              <View className="space-y-1">
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className="font-primary-bold text-base text-white"
                >
                  {movie.vote_average} <Text className="opacity-70">/ 10</Text>
                </Text>

                <View>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    className="font-primary-bold text-2xl text-white"
                  >
                    {movie.title}
                  </Text>

                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    className="font-primary-bold text-sm opacity-70 text-white"
                  >
                    {movie.overview}
                  </Text>
                </View>
              </View>

              {movie.likedByFriends && (
                <View className="flex-row items-center justify-between">
                  <Text className="font-primary-bold text-base text-white">
                    liked by friends
                  </Text>

                  <TouchableOpacity
                    className="bg-neutral-2-50 items-center justify-center rounded-full px-8 py-2"
                    activeOpacity={0.8}
                  >
                    <Text className="font-primary-bold text-base text-white">
                      see who
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}
