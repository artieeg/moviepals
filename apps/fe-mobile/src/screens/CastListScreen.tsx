import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Search } from "iconoir-react-native";
import { useDebounce } from "use-debounce";

import { Person } from "@moviepals/api";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import { Button, Input, ListItem, LoadingIndicator } from "~/components";
import { useNavigation } from "~/hooks";
import { useFilterStore } from "~/stores";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_CAST_LIST = "CastListScreen";

export function CastListScreen() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const enabledCast = useFilterStore((state) => state.cast);

  const navigation = useNavigation();

  /**
   * This function only updates the list locally.
   * */
  function onToggleCastMember(person: Person) {
    useFilterStore.getState().toggleCast(person);
  }

  function onDone() {
    navigation.goBack();
  }

  const popular = api.cast.fetchPopularCast.useInfiniteQuery(
    {},
    {
      initialCursor: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const castSearch = api.cast.search.useQuery(
    { query: debouncedSearch },
    { enabled: !!debouncedSearch },
  );

  const cast = useMemo(() => {
    if (debouncedSearch && castSearch.data) {
      return castSearch.data.cast;
    } else {
      const data = popular.data?.pages.flatMap((page) => page.cast) ?? [];
      const missingSelectedCast = enabledCast.filter(
        (c) => !data.some((s) => s.id === c.id),
      );
      return [...missingSelectedCast, ...data];
    }
  }, [castSearch.data, debouncedSearch, enabledCast, popular.data?.pages]);

  return (
    <MainLayout onGoBack={onDone} canGoBack title="Cast">
      <FlatList
        className="-mx-8 flex-1"
        data={cast}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 128 }}
        onEndReached={() => {
          if (!debouncedSearch) {
            popular.fetchNextPage();
          }
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
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
              right="checkbox"
              checked={enabledCast.some((s) => s.id === item.id)}
              onToggle={() => onToggleCastMember(item)}
            />
          );
        }}
        ListFooterComponent={() => {
          if (!popular.isLoading) {
            return null;
          }

          return (
            <View className="py-12">
              <LoadingIndicator />
            </View>
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
