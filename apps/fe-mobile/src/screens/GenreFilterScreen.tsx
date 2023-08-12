import React, { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { produce } from "immer";

import { api } from "~/utils/api";
import { Button, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export function GenreFilterScreen() {
  const ctx = api.useContext();
  const navigation = useNavigation();
  const genres = api.genres.fetchUserGenres.useQuery();

  const [enabledGenres, setEnabledGenres] = useState<number[]>([]);

  const anyGenre = enabledGenres.length === 0;

  useEffect(() => {
    if (genres.data) {
      setEnabledGenres(genres.data.filter((g) => g.enabled).map((g) => g.id));
    }
  }, [genres.data]);

  const enableGenres = api.genres.enableGenres.useMutation({
    onMutate: (data) => {
      const prev = genres.data;
      ctx.genres.fetchUserGenres.setData(
        undefined,
        produce(prev, (draft) => {
          if (!draft) return;

          for (const genre of draft) {
            genre.enabled = data.genres.includes(genre.id);
          }
        }),
      );
      return prev;
    },
  });

  function onToggleGenre(id: number, enabled: boolean) {
    setEnabledGenres((prev) => {
      if (enabled) {
        return [...prev, id];
      } else {
        return prev.filter((g) => g !== id);
      }
    });
  }

  function onSaveData() {
    enableGenres.mutate({
      genres: enabledGenres,
    });
    navigation.goBack();
  }

  function onToggleAnyGenre() {
    setEnabledGenres([]);
  }

  return (
    <MainLayout canGoBack onGoBack={onSaveData} title="genre filter">
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
            enabled={enabledGenres.includes(item.id)}
            id={item.id}
            title={item.name}
            emoji={item.emoji}
          />
        )}
        data={genres.data}
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
