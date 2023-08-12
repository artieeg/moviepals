import React from "react";
import { FlatList, View } from "react-native";
import { produce } from "immer";

import { api } from "~/utils/api";
import { Button, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export function GenreFilterScreen() {
  const navigation = useNavigation();
  const ctx = api.useContext();
  const genres = api.genres.fetchUserGenres.useQuery();

  const toggleGenre = api.genres.toggleGenre.useMutation({
    onMutate({ genre, enabled }) {
      ctx.genres.fetchUserGenres.setData(
        undefined,
        produce((data) => {
          const item = data?.find((g) => g.id === genre);

          if (!item) {
            return data;
          }

          item.enabled = enabled;
        }),
      );
    },
  });

  function onToggleGenre(id: number, enabled: boolean) {
    toggleGenre.mutate({ genre: id, enabled });
  }

  function onConfirm() {
    navigation.goBack();
  }

  return (
    <MainLayout canGoBack title="genre filter">
      <FlatList
        className="-mx-8 flex-1"
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 64 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <GenreItem
            onToggle={onToggleGenre}
            enabled={item.enabled}
            id={item.id}
            title={item.name}
            emoji={item.emoji}
          />
        )}
        data={genres.data}
      />

      <Button onPress={onConfirm} className="absolute bottom-0 left-8 right-8">
        confirm
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
