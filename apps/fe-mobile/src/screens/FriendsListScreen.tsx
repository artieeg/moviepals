import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { MoreHoriz, NavArrowRight, Search } from "iconoir-react-native";
import { produce } from "immer";
import { useColorScheme } from "nativewind";
import { useDebounce } from "use-debounce";

import { api } from "~/utils/api";
import { Input, ListItem, Prompt } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_FRIEND_REQUEST_LIST, SCREEN_USER_INFO } from "~/navigators/FriendsNavigator";
import { SCREEN_INVITE } from "./InviteScreen";
import { MainLayout } from "./layouts/MainLayout";

export function FriendsListScreen() {
  const user = api.user.getMyData.useQuery();
  const friends = api.connection.listConnections.useQuery();

  const { colorScheme } = useColorScheme();

  const connectionRequestsCount =
    api.connection_requests.countConnectionRequests.useQuery();

  const ctx = api.useContext();

  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    friends.refetch();
    connectionRequestsCount.refetch();
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      friends.refetch();
    }, []),
  );

  function onSendInvites() {
    navigation.navigate(SCREEN_INVITE);
  }

  const deleteConnection = api.connection.deleteConnection.useMutation({
    onMutate({ connectionId }) {
      ctx.connection.listConnections.setData(
        undefined,
        produce((draft) => {
          if (!draft) return draft;

          draft.connections = draft?.connections.filter(
            (item) => item.userConnectionId !== connectionId,
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

  const navigation = useNavigation();

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

  function onNeedHelp() {
    Linking.openURL("mailto:hey@moviepals.io");
  }

  function onOpenConnectionRequests() {
    navigation.navigate(SCREEN_FRIEND_REQUEST_LIST);
  }

  return (
    <MainLayout title="People">
      <View className="flex-1 space-y-8">
        <View className="space-y-2">
          <Input
            onChangeText={setQuery}
            value={query}
            placeholder="Search by username"
            showClearButton
            icon={<Search />}
          />

          {connectionRequestsCount.isSuccess &&
            connectionRequestsCount.data.count > 0 && (
              <View className="py-4">
                <ListItem
                  right="component"
                  rightComponent={<NavArrowRight />}
                  itemId="friend-requests"
                  onPress={onOpenConnectionRequests}
                  title="New Friend Requests"
                  subtitle={`You have ${connectionRequestsCount.data.count} ${
                    connectionRequestsCount.data.count === 1
                      ? "request"
                      : "requests"
                  }`}
                />
              </View>
            )}
        </View>

        <View className="flex-1">
          {query.length > 3 &&
            userSearch.isSuccess &&
            userSearch.data.length === 0 && (
              <Animated.View
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(400)}
                className="flex-1"
              >
                <Prompt
                  icon={<Text className="text-3xl">😞</Text>}
                  title="No results"
                  instantlyPressable
                  subtitle="Please check the username and try again. Still can't find them? Send us an email and we'll help!"
                  buttons={[
                    {
                      kind: "primary",
                      title: "Send Invites",
                      onPress: onSendInvites,
                    },
                    {
                      kind: "outline",
                      title: "I need help",
                      onPress: onNeedHelp,
                    },
                  ]}
                />
              </Animated.View>
            )}

          {query.length === 0 &&
            friends.isSuccess &&
            connectionRequestsCount.isSuccess &&
            connectionRequestsCount.data.count > 0 &&
            friends.data.connections.length === 0 && (
              <Animated.View
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(400)}
                className="flex-1"
              >
                <Prompt
                  icon={<Text className="text-3xl">🍿</Text>}
                  title="Somebody wants to be your friend!"
                  subtitle="Check your friend requests and accept to start discovering movies together!"
                  buttons={[
                    {
                      kind: "primary",
                      title: "Check Requests",
                      onPress: onOpenConnectionRequests,
                    },
                  ]}
                />
              </Animated.View>
            )}

          {query.length === 0 &&
            friends.isSuccess &&
            connectionRequestsCount.isSuccess &&
            connectionRequestsCount.data.count === 0 &&
            friends.data.connections.length === 0 && (
              <Animated.View
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(400)}
                className="flex-1"
              >
                <Prompt
                  icon={<Text className="text-3xl">👋</Text>}
                  title={`So empty, let's try fix that! 🤗`}
                  subtitle="Try the search or send invites to your friends"
                  buttons={[
                    {
                      kind: "primary",
                      title: "Send Invites",
                      onPress: onSendInvites,
                    },
                  ]}
                />
              </Animated.View>
            )}

          {(friends.isLoading || userSearch.isFetching) && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
              className="flex-1 justify-center items-center"
            >
              <ActivityIndicator
                size="large"
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </Animated.View>
          )}

          {userSearch.data &&
            user.isSuccess &&
            !userSearch.isFetching &&
            userSearch.isSuccess &&
            userSearch.data.length > 0 && (
              <FlatList
                data={userSearch.data}
                ItemSeparatorComponent={() => <View className="h-4" />}
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

          {!userSearch.data &&
            user.isSuccess &&
            !userSearch.isFetching &&
            query.length <= 3 &&
            friends.isSuccess &&
            friends.data.connections.length > 0 && (
              <FlatList
                data={friends.data.connections}
                ItemSeparatorComponent={() => <View className="h-4" />}
                renderItem={({ item }) => {
                  return (
                    <UserConnection
                      connectionId={item.userConnectionId}
                      userId={item.id}
                      username={item.username}
                      name={item.name}
                      emoji={item.emoji}
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
    <Animated.View entering={FadeIn} exiting={FadeOut}>
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
        subtitle={"@" + username}
        icon={emoji}
      />
    </Animated.View>
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
  const navigation = useNavigation();

  function onOpenUser() {
    navigation.navigate(SCREEN_USER_INFO, { userId });
  }

  function onOpenDialog() {
    Alert.alert("user actions", "what do you want to do?", [
      {
        style: "destructive",
        text: "remove",
        onPress: () => onRemove(connectionId),
      },
      {
        text: "go back",
        style: "cancel",
      },
    ]);
  }

  return (
    <ListItem
      onPress={onOpenUser}
      onLongPress={onOpenDialog}
      right="component"
      rightComponent={
        <TouchableOpacity onPress={onOpenDialog}>
          <MoreHoriz />
        </TouchableOpacity>
      }
      itemId={userId}
      title={name}
      subtitle={"@" + username}
      icon={emoji}
    />
  );
}
