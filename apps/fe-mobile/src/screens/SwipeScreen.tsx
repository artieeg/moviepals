import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Cancel, Heart } from "iconoir-react-native";

import { api } from "~/utils/api";
import {
  AdsOrPremiumPrompt,
  IconButton,
  MovieCard,
  MovieCardRef,
  MovieDetailsBottomSheet,
  MovieDetailsBottomSheetRef,
} from "~/components";
import { useFilterStore } from "~/stores";
import { MainLayout } from "./layouts/MainLayout";

function useAdConsentPromptStatus() {
  return useQuery(["ad-consent"], async () => {
    const value = await AsyncStorage.getItem("ad-concent");

    return { shown: Boolean(value) };
  });
}

export function SwipeScreen() {
  const user = api.user.getMyData.useQuery();
  const filters = useFilterStore((state) => state);

  const swipe = api.swipe.swipe.useMutation();

  const result = api.movie_feed.getMovieFeed.useInfiniteQuery(
    {
      genres: filters.genres,
      watchProviderIds: filters.streamingServices.map((s) => s.provider_id),
      cast: filters.cast.map((c) => c.id),
      region: filters.country,
      quick_match_mode: filters.quickMatchMode,
    },
    {
      initialCursor: 0,
      getNextPageParam: (latestResponse) => latestResponse.cursor,
    },
  );

  const [currentMovieIdx, setCurrentMovieIdx] = useState(0);
  const [showAdPermissionPrompt, setShowAdPermissionPrompt] = useState(false);

  const adConsentPromptStatus = useAdConsentPromptStatus();

  useEffect(() => {
    if (currentMovieIdx === 3) {
      setShowAdPermissionPrompt(true);

      AsyncStorage.setItem("ad-concent", "true");
    }
  }, [currentMovieIdx, adConsentPromptStatus.data?.shown]);

  const deck = useMemo(() => {
    const currentPage = result.data?.pages[result.data.pages.length - 1];

    return currentPage?.feed.slice(currentMovieIdx, currentMovieIdx + 3);
  }, [result.data?.pages, currentMovieIdx]);

  const currentMovie = deck?.[0];

  const movieDetailsRef = useRef<MovieDetailsBottomSheetRef>(null);

  function onOpenMovieDetails() {
    if (!currentMovie) return;

    const url = `https://www.themoviedb.org/movie/${currentMovie.id}`;

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
      cast: filters.cast.map((c) => c.id),
      liked: true,
      watch_providers: filters.streamingServices.map((s) => s.provider_id),
      genres: filters.genres,
      watch_region: filters.country,
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
      cast: filters.cast.map((c) => c.id),
      liked: true,
      watch_providers: filters.streamingServices.map((s) => s.provider_id),
      genres: filters.genres,
      watch_region: filters.country,
      movie_language: currentMovie.original_language,
    });

    currentMovieCard.current?.swipeLeft();

    setTimeout(() => setCurrentMovieIdx((prev) => prev + 1), 200);
  }

  return (
    <>
      <MainLayout title="swipe" canGoBack>
        {currentMovie && !showAdPermissionPrompt && (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
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
            </View>

            {result.data?.pages && (
              <Controls
                visible={!!currentMovie}
                onDislike={onDislike}
                onLike={onLike}
                onOpenMovieDetails={onOpenMovieDetails}
              />
            )}
          </Animated.View>
        )}

        {!currentMovie && !showAdPermissionPrompt && (
          <Animated.View
            className="flex-1 pb-8"
            entering={FadeIn}
            exiting={FadeOut}
          >
            <AdsOrPremiumPrompt
              mode="ad"
              visible
              onProceed={() => {
                onProceedAfterPurchaseOrAd();
                setShowAdPermissionPrompt(false);
              }}
            />
          </Animated.View>
        )}

        {showAdPermissionPrompt && (
          <Animated.View
            className="flex-1 pb-8"
            entering={FadeIn}
            exiting={FadeOut}
          >
            <AdsOrPremiumPrompt
              mode="ad-permission"
              onSkip={() => {
                setShowAdPermissionPrompt(false);
              }}
              visible
              onProceed={() => {
                onProceedAfterPurchaseOrAd();

                setShowAdPermissionPrompt(false);
              }}
            />
          </Animated.View>
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
