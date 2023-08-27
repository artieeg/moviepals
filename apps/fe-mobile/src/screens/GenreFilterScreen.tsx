import React from "react";
import { FlatList, View } from "react-native";

import { api } from "~/utils/api";
import { Button, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { useFilterStore } from "~/stores";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_GENRE_FILTER = "GenreFilter";

export function GenreFilterScreen() {
  const navigation = useNavigation();
  const allGenres = api.genres.fetchAllGenres.useQuery();

  const genres = useFilterStore((state) => state.genres);

  const anyGenre = genres.length === 0;

  function onToggleGenre(id: number) {
    useFilterStore.getState().toggleGenre(id);
  }

  function onSaveData() {
    navigation.goBack();
  }

  function onToggleAnyGenre() {
    useFilterStore.setState({
      genres: [],
    });
  }

  return (
    <MainLayout canGoBack onGoBack={onSaveData} title="Genres">
      <FlatList
        className="-mx-8 flex-1"
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 64 }}
        ListHeaderComponent={() => {
          return (
            <>
              <ListItem
                itemId="any-service"
                icon="💡"
                title="any genre"
                right="radio"
                checked={anyGenre}
                onToggle={onToggleAnyGenre}
              />
              <View className="border-neutral-4 mb-4 h-4 border-b" />
            </>
          );
        }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <GenreItem
            onToggle={onToggleGenre}
            enabled={genres.includes(item.id)}
            id={item.id}
            title={item.name}
            emoji={item.emoji}
          />
        )}
        extraData={genres}
        data={allGenres.data}
      />

      <Button onPress={onSaveData} className="absolute bottom-0 left-8 right-8">
        done
      </Button>
    </MainLayout>
  );
}

function GenreItem({
  onToggle,
  id,
  title,
  emoji,
  enabled,
}: {
  onToggle: (id: any, enabled: boolean) => void;
  id: any;
  title: string;
  emoji: string;
  enabled: boolean;
}) {
  return (
    <ListItem
      itemId={id}
      icon={emoji}
      title={title}
      right="checkbox"
      onToggle={onToggle}
      checked={enabled}
    />
  );
}
