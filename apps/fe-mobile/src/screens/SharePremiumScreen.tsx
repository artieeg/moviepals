import React, { useMemo } from "react";
import { FlatList, Text, View, ViewProps } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { api } from "~/utils/api";
import { Button, ListItem } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_SHARE_PREMIUM = "SharePremiumScreen";

export function SharePremiumScreen() {
  const user = api.user.getMyData.useQuery();
  const connections = api.connection.listConnections.useQuery();
  const sharedList = api.premium.getSharedList.useQuery();
  const sharePremium = api.premium.share.useMutation({
    onSuccess() {
      Toast.show({
        type: "success",
        text1: "You have shared your premium!",
      });
      sharedList.refetch();
    },
  });

  const list = useMemo(() => {
    if (!connections.isSuccess || !sharedList.isSuccess) return [];

    const friends = connections.data?.connections.map((item) =>
      item.firstUser.id === user.data?.id ? item.secondUser : item.firstUser,
    );

    return [
      ...(sharedList.data ?? []),
      ...friends.filter(
        (item) => !sharedList.data.some((u) => u.id === item.id),
      ),
    ];
  }, [
    connections.data,
    sharedList.data,
    user.data,
    sharedList.isSuccess,
    connections.isSuccess,
  ]);

  const [idsToShare, setIdsToShare] = React.useState<string[]>([]);

  const canShare = idsToShare.length + (sharedList.data?.length ?? 0) < 4;

  function onToggleShare(id: string, enabled: boolean) {
    if (!canShare || sharedList.data?.some((u) => u.id === id)) {
      return;
    }

    if (enabled) {
      setIdsToShare([...idsToShare, id]);
    }

    if (!enabled) {
      setIdsToShare(idsToShare.filter((item) => item !== id));
    }
  }

  function onDone() {
    sharePremium.mutate({
      userIds: idsToShare,
    });
  }

  return (
    <MainLayout title="friends">
      <View className="flex-1">
        <FlatList
          data={list}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListHeaderComponent={
            <View className="mb-8">
              <Text className="font-primary-bold text-neutral-1 text-2xl">
                Share Premium
              </Text>
              <Text className="font-primary-regular text-neutral-2 mt-1 text-base">
                Choose carefully, gifts are not meant to be taken back 😉
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 128 }}
          renderItem={({ item }) => {
            return (
              <UserOption
                shared={
                  sharedList.data?.some((u) => u.id === item.id) ??
                  idsToShare.includes(item.id)
                }
                userId={item.id}
                username={item.username}
                name={item.name}
                emoji={item.emoji}
                onToggleShare={onToggleShare}
              />
            );
          }}
        />
      </View>

      <Button
        disabled
        onPress={onDone}
        className="absolute bottom-0 left-8 right-8"
      >
        Share
      </Button>
    </MainLayout>
  );
}

function UserOption({
  userId,
  name,
  username,
  emoji,
  hideCheckbox,
  onToggleShare,
  shared,
}: ViewProps & {
  userId: string;
  name: string;
  username: string;
  hideCheckbox: boolean;
  shared?: boolean;
  emoji: string;
  onToggleShare: (id: string, requested: boolean) => void;
}) {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <ListItem
        {...(hideCheckbox
          ? { right: undefined }
          : {
              right: "checkbox",
              checked: !!shared,
              onToggle: onToggleShare,
            })}
        onPress={() => onToggleShare(userId, !shared)}
        itemId={userId}
        title={name}
        subtitle={username}
        icon={emoji}
      />
    </Animated.View>
  );
}
