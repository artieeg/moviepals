import React, {useCallback, useEffect, useState} from "react";
import { Pressable, PressableProps, Text, View } from "react-native";
import FastImage from "react-native-fast-image";

import { Movie } from "@moviepals/api";
import {FlashList} from "@shopify/flash-list";
import {Search} from "iconoir-react-native";
import {useDebounce} from "use-debounce";
import {Input} from "./Input";

export function MovieList({
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

const MovieItem = React.memo(_MovieItem);
