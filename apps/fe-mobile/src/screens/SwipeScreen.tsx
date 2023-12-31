import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, View, ViewProps } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Cancel, Heart, Undo } from "iconoir-react-native";
import { useColorScheme } from "nativewind";

import { api } from "~/utils/api";
import { sendEvent } from "~/utils/plausible";
import {
  IconButton,
  MovieCard,
  MovieCardRef,
  MovieDetailsBottomSheet,
  MovieDetailsBottomSheetRef,
  NoMoreMoviesPrompt,
  TouchableScale,
  UnableToFindMoviesPrompt,
} from "~/components";
import { useFilterStore } from "~/stores";
import { MainLayout } from "./layouts/MainLayout";

export function SwipeScreen() {
  const filters = useFilterStore((state) => state);

  const { colorScheme } = useColorScheme();

  const swipe = api.swipe.swipe.useMutation();

  const result = api.movie_feed.getMovieFeed.useInfiniteQuery(
    {
      collection_id: filters.collection_id,
      start_year: filters.start_year,
      end_year: filters.end_year,
      genres: filters.genres,
      watchProviderIds: filters.streamingServices.map((s) => s.provider_id),
      cast: filters.cast,
      directors: filters.directors,
      region: filters.country,
      quick_match_mode: filters.quickMatchMode,
    },
    {
      initialCursor: 0,
      getNextPageParam: (latestResponse) => latestResponse.cursor,
      cacheTime: 0,
      keepPreviousData: true,
    },
  );

  const [currentMovieIdx, setCurrentMovieIdx] = useState(0);
  const latestPage = result.data?.pages[result.data.pages.length - 1];

  const noMoreMovies = latestPage?.noMoreMovies;
  const unableToFindMovies = latestPage?.unableToFindMovies;

  const premiumStatus = api.user.isPaid.useQuery();

  const movies = useMemo(() => {
    if (!result.data?.pages) {
      return [];
    }

    return result.data.pages.flatMap((page) => page.feed) ?? [];
  }, [result.data?.pages]);

  useEffect(() => {
    if (!premiumStatus.isSuccess) {
      return;
    }

    if (premiumStatus.data.isPaid) {
      if (currentMovieIdx === movies.length - 4) {
        result.fetchNextPage();
      }
    }
  }, [
    premiumStatus.data?.isPaid,
    premiumStatus.isSuccess,
    currentMovieIdx,
    movies.length,
  ]);

  const deck = useMemo(() => {
    return movies.slice(currentMovieIdx, currentMovieIdx + 3);
  }, [movies, currentMovieIdx]);

  const currentMovie = deck?.[0];

  const movieDetailsRef = useRef<MovieDetailsBottomSheetRef>(null);

  function onOpenMovieDetails() {
    if (!currentMovie) return;

    const url = `https://www.themoviedb.org/movie/${currentMovie.id}`;

    sendEvent("movie_details_open");

    movieDetailsRef.current?.open(url);
  }

  const currentMovieCard = useRef<MovieCardRef>(null);

  const navigation = useNavigation();

  function onGoBack() {
    navigation.goBack();
  }

  //Fetch next page when user approaches the end of the deck
  useEffect(() => {
    if (
      currentMovieIdx > 0 &&
      currentMovieIdx > deck.length - 5 &&
      !noMoreMovies
    ) {
      result.fetchNextPage();
    }
  }, [currentMovieIdx, currentMovie, premiumStatus.data?.isPaid, noMoreMovies]);

  function onLike() {
    if (!currentMovie) {
      return;
    }

    swipe.mutate({
      movieId: currentMovie.id,
      cast: filters.cast,
      liked: true,
      directors: filters.director ? [filters.director.id] : [],
      watch_providers: filters.streamingServices.map((s) => s.provider_id),
      genres: currentMovie.genre_ids,
      watch_region: filters.country,
      movie_language: currentMovie.original_language,
    });

    sendEvent("swipe_like");

    currentMovieCard.current?.swipeRight();

    setTimeout(() => setCurrentMovieIdx((prev) => prev + 1), 200);
  }

  function onDislike() {
    if (!currentMovie) {
      return;
    }

    swipe.mutate({
      movieId: currentMovie.id,
      directors: filters.director ? [filters.director.id] : [],
      cast: filters.cast,
      liked: false,
      watch_providers: filters.streamingServices.map((s) => s.provider_id),
      genres: currentMovie.genre_ids,
      watch_region: filters.country,
      movie_language: currentMovie.original_language,
    });

    currentMovieCard.current?.swipeLeft();

    sendEvent("swipe_dislike");

    setTimeout(() => setCurrentMovieIdx((prev) => prev + 1), 200);
  }

  function onUndo() {
    setCurrentMovieIdx((prev) => (prev > 0 ? prev - 1 : 0));
  }

  const displayMode = useMemo(() => {
    if (!currentMovie) {
      if (
        result.isFetching ||
        //result.isFetchingNextPage ||
        result.isRefetching
      ) {
        return "loading";
      } else if (noMoreMovies) {
        return "no-more-movies";
      } else if (unableToFindMovies) {
        return "unable-to-find-movies";
      }
    } else if (deck.length > 0) {
      return "movies";
    } else {
      return "no-more-movies";
    }
  }, [
    result.isFetching,
    result.isFetchingNextPage,
    currentMovie,
    result.isFetching,
    result.isRefetching,
  ]);

  return (
    <>
      <MainLayout goBackCloseIcon title="Swipe" canGoBack>
        {displayMode === "movies" && (
          <View className="flex-1">
            <Animated.View
              className="flex-1"
              layout={Layout}
              entering={FadeIn}
              exiting={FadeOut}
            >
              <View className="aspect-[2/3] translate-y-8">
                {deck.map((movie, idx) => (
                  <MovieCard
                    key={movie.id}
                    ref={idx === 0 ? currentMovieCard : undefined}
                    idx={idx}
                    totalNumberOfCards={3}
                    onSwipe={(liked: boolean) => {
                      if (liked) {
                        onLike();
                      } else {
                        onDislike();
                      }
                    }}
                    movie={movie}
                  />
                ))}
              </View>

              <Controls
                onUndo={onUndo}
                visible={!!currentMovie}
                onDislike={onDislike}
                onLike={onLike}
                onOpenMovieDetails={onOpenMovieDetails}
              />
            </Animated.View>
          </View>
        )}

        {displayMode === "loading" && (
          <Animated.View
            layout={Layout}
            entering={FadeIn}
            exiting={FadeOut}
            className="flex-1 items-center justify-center pb-8"
          >
            <Animated.View layout={Layout}>
              <ActivityIndicator
                size="large"
                color={colorScheme === "dark" ? "white" : "black"}
              />

              <Animated.Text
                layout={Layout}
                entering={FadeIn.delay(600)}
                className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-center text-base mt-3"
              >
                give us a short second 😄🐢
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        )}

        {displayMode === "no-more-movies" && (
          <Animated.View
            className="flex-1 pb-8"
            entering={FadeIn}
            exiting={FadeOut}
          >
            <NoMoreMoviesPrompt onGoBack={onGoBack} />
          </Animated.View>
        )}

        {displayMode === "unable-to-find-movies" && (
          <Animated.View
            className="flex-1 pb-8"
            entering={FadeIn}
            exiting={FadeOut}
          >
            <UnableToFindMoviesPrompt onGoBack={onGoBack} />
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
  onUndo,
  visible,
  ...rest
}: ViewProps & {
  onDislike(): void;
  onLike(): void;
  onUndo(): void;
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
      layout={Layout}
      className="mt-8 flex-1 flex-row items-center justify-between space-x-3"
    >
      <IconButton variant="gray" onPress={onDislike}>
        <Cancel />
      </IconButton>

      <IconButton variant="gray" onPress={onUndo}>
        <Undo />
      </IconButton>

      <TouchableScale
        onPress={onOpenMovieDetails}
        className="bg-neutral-2-20 h-16 flex-1 items-center justify-center rounded-full"
      >
        <Text className="font-primary-bold text-neutral-1 dark:text-white">
          Details
        </Text>
      </TouchableScale>

      <IconButton variant="primary" onPress={onLike}>
        <Heart fill="white" color="white" />
      </IconButton>
    </Animated.View>
  );
}
