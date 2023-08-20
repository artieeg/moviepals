import React, { useMemo, useState } from "react";
import { View } from "react-native";

import { api } from "~/utils/api";
import { MovieList } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_MY_SWIPE_LIST = "MySwipeListScreen";

export function MySwipeListScreen() {
  const movies = api.swipe.fetchMySwipes.useInfiniteQuery(
    {},
    {
      getNextPageParam: (r) => r.nextCursor,
    },
  );

  const moviesList = useMemo(
    () => movies.data?.pages.flatMap((p) => p.movies) ?? [],
    [movies.data],
  );

  const [query, setQuery] = useState("");

  const matchedMovieSearch = api.swipe.search.useQuery(
    {
      query,
    },
    { enabled: query.length > 0 },
  );

  function onOpenMovieDetails(movieId: string) {}

  return (
    <MainLayout canGoBack title="My Swipes">
      <View className="-mx-8 flex-1">
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
    </MainLayout>
  );
}
