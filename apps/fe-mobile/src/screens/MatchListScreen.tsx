import React, { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { DateTime } from "luxon";

import { Movie } from "@moviepals/api";

import { api } from "~/utils/api";
import {
  MatchesList,
  MovieDetailsBottomSheet,
  MovieDetailsBottomSheetRef,
} from "~/components";
import { useRouteParams } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_MATCHES_LIST = "MatchesList";

export function MatchListScreen() {
  const { userIds, subtitle } = useRouteParams<{
    userIds: string[];
    title: string;
    subtitle: string;
  }>();

  const [query, setQuery] = useState("");

  const matchedMovieSearch = api.matches.search.useQuery(
    { userIds, query },
    { enabled: !!query },
  );

  const movies = api.matches.getMatches.useInfiniteQuery(
    { userIds },
    {
      initialCursor: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const moviesList = useMemo(() => {
    const dateMovieMap = new Map<string, Movie[]>();

    if (!movies.isSuccess) {
      return [];
    }

    const items =
      matchedMovieSearch.isSuccess && matchedMovieSearch.data.movies.length > 0
        ? matchedMovieSearch.data.movies
        : movies.data.pages.flatMap((page) => page.movies);

    for (const movie of items) {
      const date = DateTime.fromJSDate(movie.lastMatched);
      const isoDate = date.toISODate();

      if (!isoDate) {
        continue;
      }

      if (!dateMovieMap.has(isoDate)) {
        dateMovieMap.set(isoDate, []);
      }

      dateMovieMap.get(isoDate)!.push(movie);
    }

    return Array.from(dateMovieMap.entries()).map(([date, movies]) => ({
      date,
      movies,
    }));
  }, [
    movies.data?.pages,
    matchedMovieSearch.data,
    matchedMovieSearch.isSuccess,
  ]);

  const movieDetailsBottomSheetRef =
    React.useRef<MovieDetailsBottomSheetRef>(null);

  const onOpenMovieDetails = useCallback(
    (url: string) => movieDetailsBottomSheetRef.current?.open(url),
    [],
  );

  return (
    <>
      <MainLayout title="Movie Matches" canGoBack>
        <View className="space-y-3">
          <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
            {subtitle}
          </Text>
        </View>
        {moviesList && (
          <View className="-mx-8 pt-6 flex-1">
            <MatchesList
              onOpenMovieDetails={onOpenMovieDetails}
              onSearch={(search) => {
                setQuery(search);
              }}
              onFetchNext={() => movies.fetchNextPage()}
              movies={moviesList}
            />
          </View>
        )}
      </MainLayout>
      <MovieDetailsBottomSheet ref={movieDetailsBottomSheetRef} />
    </>
  );
}
