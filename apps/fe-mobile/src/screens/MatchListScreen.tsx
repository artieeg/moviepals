import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
} from "~/components";
import { useRouteParams } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";
import {PressableProps} from "react-native";

export function MatchListScreen() {
  const { userId } = useRouteParams<{ userId: string }>();

  const [query, setQuery] = useState("");

  const matchedMovieSearch = api.matches.search.useQuery(
    { userId, query },
    { enabled: !!query },
  );
  const movies = api.matches.getMatches.useInfiniteQuery({ userId });

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
      <MainLayout title="matches" canGoBack>
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

function MovieList({
  movies,
  onFetchNext,
  onSearch,
  onOpenMovieDetails,
}: {
  movies: Movie[];
  onFetchNext: () => void;
  onSearch: (query: string) => void;
  onOpenMovieDetails: (url: string) => void;
}) {
  const [_query, setQuery] = useState("");
  const [query] = useDebounce(_query, 300);

  useEffect(() => {
    onSearch(query);
  }, [query]);

  const renderMovieItem = useCallback(({ item }: { item: Movie }) => {
    return (
      <MovieItem
        movie={item}
        onPress={() => {
          const url = `https://www.themoviedb.org/movie/${item.id}`;

          onOpenMovieDetails(url);
        }}
      />
    );
  }, []);

  const renderItemSeparator = useCallback(() => {
    return <View className="h-3" />;
  }, []);

  const renderListHeader = useCallback(() => {
    return (
      <View className="mb-6">
        <Input onChangeText={setQuery} placeholder="Search" icon={<Search />} />
      </View>
    );
  }, []);

  return (
    <FlashList
      contentContainerStyle={{ paddingHorizontal: 32 }}
      ListHeaderComponent={renderListHeader}
      ItemSeparatorComponent={renderItemSeparator}
      data={movies}
      estimatedItemSize={64}
      renderItem={renderMovieItem}
      onEndReached={onFetchNext}
    />
  );
}

const MovieItem = React.memo(_MovieItem);

function _MovieItem({ movie, ...rest }: { movie: Movie } & PressableProps) {
  return (
    <Pressable className="h-16 flex-row items-center space-x-2" {...rest}>
      <FastImage
        className="h-16 w-16 rounded-md"
        source={{ uri: movie.poster_path }}
      />
      <Text
        numberOfLines={2}
        ellipsizeMode="tail"
        className="text-neutral-1 font-primary-regular flex-1 text-xl"
      >
        {movie.title}
      </Text>
    </Pressable>
  );
}
