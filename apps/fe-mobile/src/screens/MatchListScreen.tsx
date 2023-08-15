import React, { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { FlashList } from "@shopify/flash-list";
import { Search } from "iconoir-react-native";

import { Movie } from "@moviepals/dbmovieswipe";

import { api } from "~/utils/api";
import { Input } from "~/components";
import { useRouteParams } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export function MatchListScreen() {
  const { userId } = useRouteParams<{ userId: string }>();

  const movies = api.matches.getMatches.useInfiniteQuery({ userId });

  const moviesList = useMemo(() => {
    return movies.data?.pages.flatMap(({ movies }) => movies);
  }, [movies.data?.pages]);

  return (
    <MainLayout title="matches" canGoBack>
      {moviesList && (
        <View className="-mx-8 flex-1">
          <MovieList
            onFetchNext={() => movies.fetchNextPage()}
            movies={moviesList}
          />
        </View>
      )}
    </MainLayout>
  );
}

function MovieList({
  movies,
  onFetchNext,
}: {
  movies: Movie[];
  onFetchNext: () => void;
}) {
  const renderMovieItem = useCallback(({ item }: { item: Movie }) => {
    return <MovieItem movie={item} />;
  }, []);

  const renderItemSeparator = useCallback(() => {
    return <View className="h-3" />;
  }, []);

  const renderListHeader = useCallback(() => {
    return (
      <View className="mb-6">
        <Input placeholder="Search" icon={<Search />} />
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

function _MovieItem({ movie }: { movie: Movie }) {
  return (
    <View className="h-16 flex-row items-center space-x-2">
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
    </View>
  );
}
