import React, { useEffect, useMemo } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { MoreHoriz, NavArrowRight, Search } from "iconoir-react-native";
import { produce } from "immer";
import { useDebounce } from "use-debounce";

import { api } from "~/utils/api";
import { Input, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import {
  SCREEN_FRIEND_REQUEST_LIST,
  SCREEN_USER_INFO,
} from "~/navigators/FriendsNavigator";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_SHARE_PREMIUM = "SharePremiumScreen";

export function SharePremiumScreen() {
  const user = api.user.getMyData.useQuery();
  const userId = user.data?.id;
  const connections = api.connection.listConnections.useQuery();
  const sharedPremium = api.premium.getSharedList.useQuery();

  const ctx = api.useContext();

  const navigation = useNavigation();

  const list = useMemo(() => {
    if (!connections.data || !sharedPremium.data) return [];

    const friends = connections.data?.connections.map((item) =>
      item.firstUser.id === user.data?.id ? item.secondUser : item.firstUser,
    );

    return [
      ...(sharedPremium.data ?? []),
      ...friends.filter((item) =>
        sharedPremium.data.some((u) => u.id !== item.id),
      ),
    ];
  }, []);

  const [idsToShare, setIdsToShare] = React.useState<string[]>([]);

  function onToggleShare(id: string, enabled: boolean) {
    if (sharedPremium.data?.some((u) => u.id === id)) {
      return;
    }

    if (enabled) {
      setIdsToShare([...idsToShare, id]);
    }

    if (!enabled) {
      setIdsToShare(idsToShare.filter((item) => item !== id));
    }
  }

  return (
    <MainLayout title="friends">
      <View className="flex-1">
        <FlatList
          data={list}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => {
            return (
              <UserOption
                shared={sharedPremium.data?.some((u) => u.id === item.id)}
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
    </MainLayout>
  );
}

function UserOption({
  userId,
  name,
  username,
  emoji,
  onToggleShare,
  shared,
}: ViewProps & {
  userId: string;
  name: string;
  username: string;
  shared?: boolean;
  emoji: string;
  onToggleShare: (id: string, requested: boolean) => void;
}) {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <ListItem
        right="checkbox"
        checked={!!shared}
        onPress={() => onToggleShare(userId, !shared)}
        onToggle={onToggleShare}
        itemId={userId}
        title={name}
        subtitle={username}
        icon={emoji}
      />
    </Animated.View>
  );
}
