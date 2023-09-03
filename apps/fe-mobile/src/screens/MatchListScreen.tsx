import React, { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { api } from "~/utils/api";
import {
  MovieDetailsBottomSheet,
  MovieDetailsBottomSheetRef,
  MovieList,
} from "~/components";
import { useRouteParams } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_MATCHES_LIST = "MatchesList";

export function MatchListScreen() {
  const { userIds, title, subtitle } = useRouteParams<{
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
    return movies.data?.pages.flatMap(({ movies }) => movies);
  }, [movies.data?.pages]);

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
            <MovieList
              onOpenMovieDetails={onOpenMovieDetails}
              onSearch={(search) => {
                setQuery(search);
              }}
              onFetchNext={() => movies.fetchNextPage()}
              movies={
                matchedMovieSearch.isSuccess &&
                matchedMovieSearch.data.movies.length > 0
                  ? matchedMovieSearch.data.movies
                  : moviesList
              }
            />
          </View>
        )}
      </MainLayout>
      <MovieDetailsBottomSheet ref={movieDetailsBottomSheetRef} />
    </>
  );
}
