import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  ViewProps,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import { api } from "~/utils/api";
import { sendEvent } from "~/utils/plausible";
import { Button, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";
import { SCREEN_MATCHES_LIST } from "./MatchListScreen";

export const SCREEN_MATCH_LIST_V2 = "SCREEN_MATCH_LIST_v2";

export function MatchListScreenV2() {
  const [selectedUsers, setSelectedUserIds] = useState<string[]>([]);

  const user = api.user.getMyData.useQuery();
  const friends = api.connection.listConnections.useQuery();

  const { colorScheme } = useColorScheme();

  const navigation = useNavigation();

  function onFetchMatches() {
    sendEvent("see_movie_matches");

    const names = selectedUsers
      .map((id) => {
        const user = friends.data?.connections.find((item) => item.id === id);
        return user?.name;
      })
      .filter(Boolean);

    navigation.navigate(SCREEN_MATCHES_LIST, {
      userIds: selectedUsers,
      title: "Matches",
      subtitle:
        names.length === 1
          ? `Movies that you and ${names[0]} both want to watch:`
          : `Movies that you, ${names.slice(0, -1).join(", ")}, and ${
              names[names.length - 1]
            } all want to watch`,
    });
  }

  useFocusEffect(
    useCallback(() => {
      friends.refetch();
    }, []),
  );

  return (
    <MainLayout edges={["top"]} title="Matches">
      <View className="flex-1 space-y-8">
        <View className="space-y-3">
          <Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl">
            View movie matches
          </Text>
          <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
            Select up to 6 friends to see movies you all want to watch
          </Text>
        </View>

        <View className="flex-1">
          {friends.isLoading && (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator
                size="large"
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </View>
          )}

          {user.isSuccess && friends.isSuccess && (
            <FlatList
              data={friends.data?.connections}
              contentContainerStyle={{ paddingBottom: 128 }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item }) => {
                return (
                  <UserMatchOption
                    selected={selectedUsers.includes(item.id)}
                    userId={item.id}
                    onToggle={(id, value) => {
                      if (value) {
                        setSelectedUserIds((prev) => [...prev, id]);
                      } else {
                        setSelectedUserIds((prev) =>
                          prev.filter((item) => item !== id),
                        );
                      }
                    }}
                    username={item.username}
                    name={item.name}
                    emoji={item.emoji}
                  />
                );
              }}
            />
          )}
        </View>
      </View>
      <Button
        disabled={selectedUsers.length === 0}
        onPress={onFetchMatches}
        className="absolute bottom-8 left-8 right-8"
      >
        See movie matches 🍿
      </Button>
    </MainLayout>
  );
}

function UserMatchOption({
  userId,
  name,
  username,
  emoji,
  selected,
  onToggle,
}: ViewProps & {
  selected: boolean;
  userId: string;
  name: string;
  username: string;
  onToggle: (id: string, value: boolean) => void;
  emoji: string;
}) {
  return (
    <ListItem
      onPress={() => onToggle(userId, !selected)}
      right="checkbox"
      checked={selected}
      itemId={userId}
      title={name}
      onToggle={onToggle}
      subtitle={"@" + username}
      icon={emoji}
    />
  );
}
