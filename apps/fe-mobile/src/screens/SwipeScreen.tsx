import React, { useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useRoute } from "@react-navigation/native";
import { Cancel, Heart } from "iconoir-react-native";

import { api } from "~/utils/api";
import {
  IconButton,
  MovieCard,
  MovieCardRef,
  MovieDetailsBottomSheet,
  MovieDetailsBottomSheetRef,
  RanOutOfSwipes,
} from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export function SwipeScreen() {
  const user = api.user.getUserData.useQuery();
  const genres = api.genres.fetchUserGenres.useQuery(undefined, {
    select: (data) =>
      data?.filter((genre) => genre.enabled).map((genre) => genre.id),
  });

  const { quickMatchMode } = useRoute().params as { quickMatchMode: boolean };

  const swipe = api.swipe.swipe.useMutation();

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
      quick_match_mode: quickMatchMode,
    },
    {
      initialCursor: 0,
      getNextPageParam: (latestResponse) => latestResponse.cursor,
    },
  );

  const [currentMovieIdx, setCurrentMovieIdx] = useState(0);

  const deck = useMemo(() => {
    const currentPage = result.data?.pages[result.data.pages.length - 1];

    return currentPage?.feed.slice(currentMovieIdx, currentMovieIdx + 3);
  }, [result.data?.pages, currentMovieIdx]);

  const currentMovie = deck?.[0];

  const movieDetailsRef = useRef<MovieDetailsBottomSheetRef>(null);

  function onOpenMovieDetails() {
    const url = `https://www.themoviedb.org/movie/${deck![0].id}`;

    movieDetailsRef.current?.open(url);
  }

  const currentMovieCard = useRef<MovieCardRef>(null);

  function onProceedAfterPurchaseOrAd() {
    setTimeout(async () => {
      await result.fetchNextPage();

      setCurrentMovieIdx(0);
    }, 1000);
  }

  function onLike() {
    if (!currentMovie) {
      return;
    }

    swipe.mutate({
      movieId: currentMovie.id,
      liked: true,
      watch_providers: watchProviders.data ?? [],
      genres: genres.data ?? [],
      watch_region: user.data!.country,
      movie_language: currentMovie.original_language,
    });

    currentMovieCard.current?.swipeRight();

    setTimeout(() => setCurrentMovieIdx((prev) => prev + 1), 200);
  }

  function onDislike() {
    if (!currentMovie) {
      return;
    }

    swipe.mutate({
      movieId: currentMovie.id,
      liked: false,
      watch_providers: watchProviders.data ?? [],
      genres: genres.data ?? [],
      watch_region: user.data!.country,
      movie_language: currentMovie.original_language,
    });

    currentMovieCard.current?.swipeLeft();

    setTimeout(() => setCurrentMovieIdx((prev) => prev + 1), 200);
  }

  return (
    <>
      <MainLayout title="swipe" canGoBack>
        <View className="aspect-[2/3] translate-y-8">
          {result.isSuccess &&
            deck &&
            deck.map((movie, idx) => (
              <MovieCard
                key={movie.id}
                ref={idx === 0 ? currentMovieCard : undefined}
                idx={idx}
                totalNumberOfCards={3}
                onSwipe={(liked: boolean) => {
                  if (!currentMovie) {
                    return;
                  }

                  swipe.mutate({
                    movieId: currentMovie.id,
                    liked,
                    watch_providers: watchProviders.data ?? [],
                    genres: currentMovie.genre_ids,
                    watch_region: user.data!.country,
                    movie_language: currentMovie.original_language,
                  });

                  setCurrentMovieIdx((prev) => prev + 1);
                }}
                movie={movie}
              />
            ))}

          {result.data?.pages && (
            <RanOutOfSwipes
              visible={
                !currentMovie
              }
              onProceed={onProceedAfterPurchaseOrAd}
            />
          )}
        </View>

        {result.data?.pages && (
          <Controls
            visible={
              !!currentMovie
            }
            onDislike={onDislike}
            onLike={onLike}
            onOpenMovieDetails={onOpenMovieDetails}
          />
        )}
      </MainLayout>
      <MovieDetailsBottomSheet ref={movieDetailsRef} />
    </>
  );
}

function Controls({
  onDislike,
  onLike,
  onOpenMovieDetails,
  visible,
  ...rest
}: ViewProps & {
  onDislike(): void;
  onLike(): void;
  onOpenMovieDetails(): void;
  visible: boolean;
}) {
  const opacity = useDerivedValue(() => {
    return withTiming(visible ? 1 : 0);
  });

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      {...rest}
      pointerEvents={visible ? "auto" : "none"}
      style={[style, rest.style]}
      className="mt-8 flex-1 flex-row items-center justify-between space-x-3 px-8"
    >
      <IconButton variant="red" onPress={onDislike}>
        <Cancel color="white" />
      </IconButton>

      <TouchableOpacity
        onPress={onOpenMovieDetails}
        className="bg-neutral-2-10 h-16 flex-1 items-center justify-center rounded-full"
      >
        <Text className="font-primary-bold text-neutral-1">details</Text>
      </TouchableOpacity>

      <IconButton variant="primary" onPress={onLike}>
        <Heart fill="white" color="white" />
      </IconButton>
    </Animated.View>
  );
}
