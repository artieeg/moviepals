import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  PressableProps,
  SectionList,
  Text,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { Search } from "iconoir-react-native";
import { DateTime } from "luxon";
import { useDebounce } from "use-debounce";

import { Movie } from "@moviepals/api";

import { Input } from "./Input";

export function MatchesList({
  movies,
  onFetchNext,
  onSearch,
  onOpenMovieDetails,
}: {
  movies: { date: string; movies: Movie[] }[];
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

  const sections = useMemo(() => {
    return movies.map((section) => {
      return {
        title: `Matches on ${DateTime.fromISO(section.date).toFormat("EEEE, MMM d")}`,
        data: section.movies,
      };
    });
  }, [movies]);

  console.log(sections);

  return (
    <SectionList
      contentContainerStyle={{ paddingHorizontal: 32 }}
      ListHeaderComponent={renderListHeader}
      ItemSeparatorComponent={renderItemSeparator}
      renderSectionHeader={({ section }) => {
        return (
          <Text className="text-neutral-1 dark:text-white bg-white dark:bg-neutral-1 py-3 font-primary-bold text-base">
            {section.title}
          </Text>
        );
      }}
      sections={sections}
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
        className="text-neutral-1 dark:text-white font-primary-regular flex-1 text-xl"
      >
        {movie.title}
      </Text>
    </Pressable>
  );
}

const MovieItem = React.memo(_MovieItem);
