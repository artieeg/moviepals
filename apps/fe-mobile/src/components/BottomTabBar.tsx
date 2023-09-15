import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  CinemaOld,
  Group,
  IconoirProvider,
  MediaVideoList,
  PeopleTag,
} from "iconoir-react-native";
import { useColorScheme } from "nativewind";
import { twJoin } from "tailwind-merge";

import { useNavigation } from "~/hooks";
import {
  NAVIGATOR_FRIENDS,
  NAVIGATOR_MATCHES,
  NAVIGATOR_ME,
  NAVIGATOR_SWIPE,
} from "~/navigators/MainNavigator";

function useThemedSelectionColors() {
  const { colorScheme } = useColorScheme();

  if (colorScheme === "light") {
    return { selected: "#0E0C10", unselected: "#71707B" };
  } else {
    return { selected: "white", unselected: "#9CA3AF" };
  }
}

export function BottomTabBar(props: BottomTabBarProps) {
  const navigation = useNavigation();
  const currentRoute = props.state.routes[props.state.index].name;

  const { selected, unselected } = useThemedSelectionColors();

  const isSwipeNavigator = currentRoute === NAVIGATOR_SWIPE;
  const isFriendsNavigator = currentRoute === NAVIGATOR_FRIENDS;
  const isMatchesNavigator = currentRoute === NAVIGATOR_MATCHES;
  const isMeNavigator = currentRoute === NAVIGATOR_ME;

  const { bottom } = useSafeAreaInsets();

  const { colorScheme } = useColorScheme();

  return (
    <IconoirProvider
      iconProps={{
        width: 32,
        height: 32,
        strokeWidth: 2,
        color: colorScheme === "dark" ? "#FFFFFF" : "#0E0C10",
      }}
    >
      <View
        style={{
          paddingBottom: bottom ? bottom : 12,
        }}
        className="flex-row justify-between bg-white dark:bg-neutral-1 px-4 border-t border-neutral-4 dark:border-neutral-2-50"
      >
        <Pressable
          onPress={() => navigation.navigate(NAVIGATOR_SWIPE)}
          className="flex-1 items-center justify-center space-y-1 pt-4"
        >
          <CinemaOld color={isSwipeNavigator ? selected : unselected} />
          <Text
            className={twJoin(
              "font-primary-bold",
              isSwipeNavigator
                ? "text-neutral-1 dark:text-white"
                : "text-neutral-2 dark:text-neutral-5",
            )}
          >
            movies
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate(NAVIGATOR_FRIENDS)}
          className="flex-1 items-center justify-center space-y-1 pt-4"
        >
          <Group color={isFriendsNavigator ? selected : unselected} />
          <Text
            className={twJoin(
              "font-primary-bold",
              isFriendsNavigator
                ? "text-neutral-1 dark:text-white"
                : "text-neutral-2 dark:text-neutral-5",
            )}
          >
            people
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate(NAVIGATOR_MATCHES)}
          className="flex-1 items-center justify-center space-y-1 pt-4"
        >
          <MediaVideoList color={isMatchesNavigator ? selected : unselected} />
          <Text
            className={twJoin(
              "font-primary-bold",
              isMatchesNavigator
                ? "text-neutral-1 dark:text-white"
                : "text-neutral-2 dark:text-neutral-5",
            )}
          >
            matches
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate(NAVIGATOR_ME)}
          className="flex-1 items-center justify-center space-y-1 pt-4"
        >
          <PeopleTag color={isMeNavigator ? selected : unselected} />
          <Text
            className={twJoin(
              "font-primary-bold",
              isMeNavigator
                ? "text-neutral-1 dark:text-white"
                : "text-neutral-2 dark:text-neutral-5",
            )}
          >
            me
          </Text>
        </Pressable>
      </View>
    </IconoirProvider>
  );
}
