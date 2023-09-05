import React from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import { produce } from "immer";

import { api } from "~/utils/api";
import { ListItem } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export function FriendRequestListScreen() {
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
              (item) => item.connectionRequestId !== connectionRequestId,
            );
          }),
        );
      },
    });

  const rejectConnectionRequest =
    api.connection_requests.rejectConnectionRequest.useMutation({
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

            draft.requests = draft?.requests.filter((item) => item.id !== user);
          }),
        );
      },
    });

  function onAcceptRequest(id: string) {
    acceptConnectionRequest.mutate({ connectionRequestId: id });
  }

  function onRejectRequest(user: string) {
    Alert.alert("Block user", "Are you sure you want to block this user? This action cannot be undone", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Block",
        style: "destructive",
        onPress() {
          rejectConnectionRequest.mutate({ user: user });
        },
      },
    ]);
  }

  return (
    <MainLayout canGoBack title="friend requests">
      <View className="flex-1 space-y-8">
        <FlatList
          data={friendRequestList.data?.requests}
          renderItem={({ item }) => {
            return (
              <FriendRequestItem
                connectionId={item.connectionRequestId}
                userId={item.id}
                username={item.username}
                onAcceptRequest={onAcceptRequest}
                onRejectRequest={onRejectRequest}
                name={item.name}
                emoji={item.emoji}
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
          <Text className="text-red-1 font-primary-bold text-lg">
            reject & block
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onAcceptRequest(connectionId)}>
          <Text className="text-brand-1 font-primary-bold text-lg">accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
