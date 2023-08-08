import React from "react";
import {
  Alert,
  FlatList,
  Text,
  Touchable,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import { MoreHoriz, NavArrowRight, Search } from "iconoir-react-native";
import { produce } from "immer";
import { useDebounce } from "use-debounce";

import { api } from "~/utils/api";
import { Input, ListItem } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export function FriendRequestListScreen() {
  const user = api.user.getUserData.useQuery();
  const friendRequestList =
    api.connection_requests.listConnectionRequests.useQuery();

  const ctx = api.useContext();

  const acceptConnectionRequest =
    api.connection_requests.acceptConnectionRequest.useMutation({
      onMutate({ connectionRequestId }) {
        ctx.connection_requests.countConnectionRequests.setData(
          undefined,
          produce((draft) => {
            if (!draft) return draft;

            draft.count = draft?.count - 1;
          }),
        );

        ctx.connection_requests.listConnectionRequests.setData(
          undefined,
          produce((draft) => {
            if (!draft) return draft;

            draft.requests = draft?.requests.filter(
              (item) => item.id !== connectionRequestId,
            );
          }),
        );
      },
    });

  const deleteConnectionRequest =
    api.connection_requests.deleteConnectionRequest.useMutation({
      onMutate({ user }) {
        ctx.connection_requests.countConnectionRequests.setData(
          undefined,
          produce((draft) => {
            if (!draft) return draft;

            draft.count = draft?.count - 1;
          }),
        );

        ctx.connection_requests.listConnectionRequests.setData(
          undefined,
          produce((draft) => {
            if (!draft) return draft;

            draft.requests = draft?.requests.filter(
              (item) => item.firstUserId !== user,
            );
          }),
        );
      },
    });

  function onAcceptRequest(id: string) {
    acceptConnectionRequest.mutate({ connectionRequestId: id });
  }

  function onRejectRequest(user: string) {
    deleteConnectionRequest.mutate({ user: user });
  }

  return (
    <MainLayout canGoBack title="friend requests">
      <View className="flex-1 space-y-8">
        <FlatList
          data={friendRequestList.data?.requests}
          renderItem={({ item }) => {
            const requestingUser = item.firstUser;

            return (
              <FriendRequestItem
                connectionId={item.id}
                userId={requestingUser.id}
                username={requestingUser.username}
                onAcceptRequest={onAcceptRequest}
                onRejectRequest={onRejectRequest}
                name={requestingUser.name}
                emoji={requestingUser.emoji}
              />
            );
          }}
        />
      </View>
    </MainLayout>
  );
}

function FriendRequestItem({
  userId,
  connectionId,
  name,
  username,
  emoji,
  onAcceptRequest,
  onRejectRequest,
}: ViewProps & {
  connectionId: string;
  userId: string;
  name: string;
  username: string;
  emoji: string;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (userId: string) => void;
}) {
  return (
    <View>
      <ListItem
        right={undefined}
        itemId={userId}
        title={name}
        subtitle={username}
        icon={emoji}
      />
      <View className="flex-row justify-between">
        <TouchableOpacity onPress={() => onRejectRequest(userId)}>
          <Text className="text-red-1 font-primary-bold text-lg">reject</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onAcceptRequest(connectionId)}>
          <Text className="text-brand-1 font-primary-bold text-lg">accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
