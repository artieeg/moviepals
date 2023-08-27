import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, PressableProps, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { FlashList } from "@shopify/flash-list";
import { Search } from "iconoir-react-native";
import { useDebounce } from "use-debounce";

import { Movie } from "@moviepals/dbmovieswipe";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import {
  Input,
  MovieDetailsBottomSheet,
  MovieDetailsBottomSheetRef,
  MovieItem,
  MovieList,
} from "~/components";
import { useRouteParams } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export function MatchListScreen() {
  const { userId } = useRouteParams<{ userId: string }>();

  const [query, setQuery] = useState("");

  const matchedMovieSearch = api.matches.search.useQuery(
    { userId, query },
    { enabled: !!query },
  );

  const movies = api.matches.getMatches.useInfiniteQuery(
    { userId },
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
        {moviesList && (
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
        )}
      </MainLayout>
      <MovieDetailsBottomSheet ref={movieDetailsBottomSheetRef} />
    </>
  );
}
