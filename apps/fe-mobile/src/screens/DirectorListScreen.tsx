import React, { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Search } from "iconoir-react-native";
import { useDebounce } from "use-debounce";

import { Person } from "@moviepals/api";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import { Button, Input, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { useFilterStore } from "~/stores";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_DIRECTOR_LIST = "DirectorListScreen";

export function DirectorListScreen() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const director = useFilterStore((state) => state.director);

  const navigation = useNavigation();

  function onToggleDirector(person: Person) {
    useFilterStore.getState().toggleDirector(person);
  }

  function onDone() {
    navigation.goBack();
  }

  const directorSearch = api.director.search.useQuery(
    { query: debouncedSearch },
    { enabled: !!debouncedSearch },
  );

  const cast = useMemo(() => {
    let source: Person[] = [];

    if (debouncedSearch && directorSearch.data) {
      source = directorSearch.data.directors;
    }

    if (director && !source.some((s) => s.id === director.id)) {
      return [director, ...source];
    } else {
      return source;
    }
  }, [directorSearch.data, debouncedSearch, director]);

  return (
    <MainLayout onGoBack={onDone} canGoBack title="directors">
      <FlatList
        className="-mx-8 flex-1"
        data={cast}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 128 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListFooterComponent={
          <View className="flex-1 items-center justify-center mt-4">
            <Text className="font-primary-regular text-neutral-2">
              Type something in the search bar. Right now, you can only filter
              by one director at the time
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <ListItem
              icon={
                item.profile_path ? (
                  <FastImage
                    className="h-full w-full"
                    source={{ uri: getTMDBStaticUrl(item.profile_path, "w45") }}
                  />
                ) : null
              }
              itemId={item.id}
              title={item.name}
              right="radio"
              checked={director?.id === item.id}
              onToggle={() => onToggleDirector(item)}
            />
          );
        }}
        ListHeaderComponent={
          <View className="mb-4 space-y-8">
            <Input
              icon={<Search />}
              placeholder="search"
              value={search}
              onChangeText={(v) => setSearch(v)}
              showClearButton
            />
          </View>
        }
      />

      <Button onPress={onDone} className="absolute bottom-0 left-8 right-8">
        done
      </Button>
    </MainLayout>
  );
}
