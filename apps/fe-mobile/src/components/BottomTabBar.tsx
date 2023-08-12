import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Bell, CinemaOld, Group, PeopleTag } from "iconoir-react-native";
import { twJoin } from "tailwind-merge";

import { useNavigation } from "~/hooks";
import {
  NAVIGATOR_EVENTS,
  NAVIGATOR_FRIENDS,
  NAVIGATOR_ME,
  NAVIGATOR_SWIPE,
} from "~/navigators/MainNavigator";

export function BottomTabBar(props: BottomTabBarProps) {
  const navigation = useNavigation();
  const currentRoute = props.state.routes[props.state.index].name;

  const isSwipeNavigator = currentRoute === NAVIGATOR_SWIPE;
  const isFriendsNavigator = currentRoute === NAVIGATOR_FRIENDS;
  const isEventsNavigator = currentRoute === NAVIGATOR_EVENTS;
  const isMeNavigator = currentRoute === NAVIGATOR_ME;

  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingBottom: bottom ? bottom : 12,
      }}
      className="flex-row justify-between bg-white px-4"
    >
      <Pressable
        onPress={() => navigation.navigate(NAVIGATOR_SWIPE)}
        className="flex-1 items-center justify-center space-y-1 pt-4"
      >
        <CinemaOld
          width="24"
          height="24"
          color={isSwipeNavigator ? "#0E0C10" : "#71707B"}
        />
        <Text
          className={twJoin(
            "font-primary-bold",
            isSwipeNavigator ? "text-neutral-1" : "text-neutral-2",
          )}
        >
          movies
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate(NAVIGATOR_FRIENDS)}
        className="flex-1 items-center justify-center space-y-1 pt-4"
      >
        <Group
          width="24"
          height="24"
          color={isFriendsNavigator ? "#0E0C10" : "#71707B"}
        />
        <Text
          className={twJoin(
            "font-primary-bold",
            isFriendsNavigator ? "text-neutral-1" : "text-neutral-2",
          )}
        >
          friends
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate(NAVIGATOR_EVENTS)}
        className="flex-1 items-center justify-center space-y-1 pt-4"
      >
        <Bell
          color={isEventsNavigator ? "#0E0C10" : "#71707B"}
          width="24"
          height="24"
        />
        <Text
          className={twJoin(
            "font-primary-bold",
            isEventsNavigator ? "text-neutral-1" : "text-neutral-2",
          )}
        >
          events
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate(NAVIGATOR_ME)}
        className="flex-1 items-center justify-center space-y-1 pt-4"
      >
        <PeopleTag
          color={isMeNavigator ? "#0E0C10" : "#71707B"}
          width="24"
          height="24"
        />
        <Text
          className={twJoin(
            "font-primary-bold",
            isMeNavigator ? "text-neutral-1" : "text-neutral-2",
          )}
        >
          me
        </Text>
      </Pressable>
    </View>
  );
}
