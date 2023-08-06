import React from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { MoreHoriz, Search } from "iconoir-react-native";
import { produce } from "immer";
import { useDebounce } from "use-debounce";

import { api } from "~/utils/api";
import { Input, ListItem } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export function FriendsListScreen() {
  const user = api.user.getUserData.useQuery();
  const friends = api.connection.listConnections.useQuery();

  const ctx = api.useContext();

  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);

  const deleteConnection = api.connection.deleteConnection.useMutation({
    onMutate({ connectionId }) {
      ctx.connection.listConnections.setData(
        undefined,
        produce((draft) => {
          if (!draft) return draft;

          draft.connections = draft?.connections.filter(
            (item) => item.id !== connectionId,
          );
        }),
      );
    },
  });

  const postConnectionRequest =
    api.connection_requests.postConnectionRequest.useMutation({
      onMutate({ user }) {
        ctx.user.search.setData(
          { query: debouncedQuery },
          produce((data) => {
            const requestedUser = data?.find((item) => item.id === user);

            if (requestedUser) {
              requestedUser.requested = true;
            }
          }),
        );
      },
    });

  const deleteConnectionRequest =
    api.connection_requests.deleteConnectionRequest.useMutation({
      onMutate({ user }) {
        ctx.user.search.setData(
          { query: debouncedQuery },
          produce((data) => {
            const requestedUser = data?.find((item) => item.id === user);

            if (requestedUser) {
              requestedUser.requested = false;
            }
          }),
        );
      },
    });

  const userSearch = api.user.search.useQuery(
    {
      query: debouncedQuery,
    },
    {
      enabled: debouncedQuery.length > 3,
    },
  );

  function onToggleRequest(userId: string, requested: boolean) {
    if (requested) {
      postConnectionRequest.mutate({ user: userId });
    } else {
      deleteConnectionRequest.mutate({ user: userId });
    }
  }

  function onRemoveConnection(connectionId: string) {
    deleteConnection.mutate({ connectionId });
  }

  return (
    <MainLayout title="friends">
      <View className="flex-1 space-y-8">
        <Input
          onChangeText={setQuery}
          value={query}
          placeholder="search"
          showClearButton
          icon={<Search />}
        />
        <View className="flex-1">
          {userSearch.data && user.isSuccess && friends.isSuccess && (
            <FlatList
              data={userSearch.data}
              renderItem={({ item }) => {
                return (
                  <UnknownUser
                    userId={item.id}
                    username={item.username}
                    name={item.name}
                    emoji={item.emoji}
                    requested={item.requested}
                    onToggleRequest={onToggleRequest}
                  />
                );
              }}
            />
          )}

          {!userSearch.data && user.isSuccess && friends.isSuccess && (
            <FlatList
              data={friends.data?.connections}
              renderItem={({ item }) => {
                const source =
                  item.firstUser.id === user.data?.id
                    ? item.secondUser
                    : item.firstUser;

                return (
                  <UserConnection
                    connectionId={item.id}
                    userId={source.id}
                    username={source.username}
                    name={source.name}
                    emoji={source.emoji}
                    isFollowing
                    onRemove={onRemoveConnection}
                  />
                );
              }}
            />
          )}
        </View>
      </View>
    </MainLayout>
  );
}

function UnknownUser({
  userId,
  name,
  username,
  emoji,
  onToggleRequest,
  requested,
}: ViewProps & {
  userId: string;
  name: string;
  username: string;
  requested: boolean;
  emoji: string;
  onToggleRequest: (id: string, requested: boolean) => void;
}) {
  return (
    <ListItem
      right="component"
      onPress={() => onToggleRequest(userId, !requested)}
      rightComponent={
        <Text className="text-brand-1 font-primary-bold text-lg">
          {requested ? "requested" : "request"}
        </Text>
      }
      itemId={userId}
      title={name}
      subtitle={username}
      icon={emoji}
    />
  );
}

function UserConnection({
  connectionId,
  userId,
  name,
  username,
  emoji,
  onRemove,
}: ViewProps & {
  connectionId: string;
  userId: string;
  name: string;
  username: string;
  emoji: string;
  isFollowing: boolean;
  onRemove: (userId: string) => void;
}) {
  function onOpenDialog() {
    Alert.alert("user actions", "what do you want to do?", [
      {
        text: "remove",
        onPress: () => onRemove(connectionId),
      },
      {
        text: "cancel",
        style: "cancel",
      },
    ]);
  }

  return (
    <ListItem
      right="component"
      rightComponent={
        <TouchableOpacity onPress={onOpenDialog}>
          <MoreHoriz />
        </TouchableOpacity>
      }
      itemId={userId}
      title={name}
      subtitle={username}
      icon={emoji}
    />
  );
}
