import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";
import FastImage from "react-native-fast-image";
import Toast from "react-native-toast-message";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import { Button, Section, Switch } from "~/components";
import { useAdmob, useNavigation, useTimezone } from "~/hooks";
import {
  SCREEN_GENRE_FILTER,
  SCREEN_STREAMING_SERVICE_LIST,
  SCREEN_SWIPE,
} from "~/navigators/SwipeNavigator";
import { useFilterStore } from "~/stores";
import { SCREEN_CAST_LIST } from "./CastListScreen";
import { SCREEN_DIRECTOR_LIST } from "./DirectorListScreen";
import { MainLayout } from "./layouts/MainLayout";

export function PrepareSwipeScreen() {
  const [quickMatchMode, setQuickMatchMode] = React.useState(true);

  useTimezone();

  useAdmob();

  const navigation = useNavigation();

  function onStartSwiping() {
    navigation.navigate(SCREEN_SWIPE, { quickMatchMode });
  }

  return (
    <MainLayout title="movies">
      <ScrollView
        className="-mx-8"
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingBottom: 128,
        }}
      >
        <View className="space-y-6 pb-3">
          <MyStreamingServicesSection />
          <GenreFilter />
          <CastFilter />
          <DirectorFilter />
          <QuickMatchMode
            enabled={quickMatchMode}
            onToggle={(v) => {
              setQuickMatchMode(v);
            }}
          />
        </View>

        <View className="border-neutral-2-10 mt-6 space-y-6 border-t pt-6">
          <ResetFilters />
          <ResetSwipes />
        </View>
      </ScrollView>

      <Button
        onPress={onStartSwiping}
        className="absolute bottom-0 left-8 right-8"
      >
        Start Swiping
      </Button>
    </MainLayout>
  );
}

function ResetSwipes(props: ViewProps) {
  const resetSwipes = api.swipe.reset.useMutation({
    onSuccess() {
      Toast.show({
        type: "success",
        text1: "Swipes reset",
        text2: "Your swipes have been reset",
      });
    },
  });

  function onReset() {
    Alert.alert("Reset swipes", "Are you sure you want to reset your swipes?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          resetSwipes.mutate();
        },
      },
    ]);
  }

  return (
    <Section
      {...props}
      onPress={onReset}
      right={
        resetSwipes.isLoading ? (
          <View className="h-5 w-5">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="w-5" />
        )
      }
      title="Reset swipes"
      subtitle="Reset your swipes and start swiping from a clean slate"
    />
  );
}

function ResetFilters(props: ViewProps) {
  function onReset() {
    Alert.alert(
      "Reset filters",
      "Are you sure you want to reset all filters?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            useFilterStore.getState().reset();
          },
        },
      ],
    );
  }

  return (
    <Section
      {...props}
      onPress={onReset}
      title="Reset filters"
      subtitle="Reset all filters"
    />
  );
}

function QuickMatchMode({
  enabled,
  onToggle,
  ...rest
}: {
  enabled: boolean;
  onToggle(enabled: boolean): void;
}) {
  return (
    <Section
      title="Quick match mode"
      subtitle="Include friend movies even if they don't match your genre selection"
      onPress={() => onToggle(!enabled)}
      {...rest}
      right={
        <View className="ml-4">
          <Switch enabled={enabled} onToggle={onToggle} />
        </View>
      }
    />
  );
}

function GenreFilter(props: TouchableOpacityProps) {
  const navigation = useNavigation();

  const enabledGenreCount = useFilterStore((state) => state.genres.length);

  function onPress() {
    navigation.navigate(SCREEN_GENRE_FILTER);
  }

  return (
    <Section
      title="Genre filter"
      subtitle={
        enabledGenreCount > 0
          ? `${enabledGenreCount} enabled genres`
          : "any genre"
      }
      showArrowRight
      onPress={onPress}
      {...props}
    />
  );
}

function MyStreamingServicesSection() {
  const navigation = useNavigation();

  const streamingServices = useFilterStore((state) => state.streamingServices);

  function onPress() {
    navigation.navigate(SCREEN_STREAMING_SERVICE_LIST);
  }

  return (
    <Section
      title="My streaming services"
      onPress={onPress}
      showArrowRight
      subtitle={
        streamingServices.length === 0 ? (
          "using any service"
        ) : (
          <View className="mt-2">
            <FlatList
              horizontal
              ItemSeparatorComponent={() => <View className="w-2" />}
              data={streamingServices}
              renderItem={({ item }) => {
                return (
                  <FastImage
                    resizeMode="contain"
                    source={{
                      uri: getTMDBStaticUrl(item.logo_path),
                    }}
                    className="h-8 w-8 rounded-lg"
                  />
                );
              }}
            />
          </View>
        )
      }
    />
  );
}

function CastFilter(props: TouchableOpacityProps) {
  const navigation = useNavigation();

  const enabledCastCount = useFilterStore((state) => state.cast.length);

  function onOpen() {
    navigation.navigate(SCREEN_CAST_LIST);
  }

  return (
    <Section
      onPress={onOpen}
      title="Cast filter"
      showArrowRight
      subtitle={
        enabledCastCount > 0
          ? `filter by ${enabledCastCount} cast members`
          : "any cast"
      }
      {...props}
    />
  );
}

function DirectorFilter(props: TouchableOpacityProps) {
  const director = useFilterStore((state) => state.director);

  const navigation = useNavigation();

  function onOpen() {
    navigation.navigate(SCREEN_DIRECTOR_LIST);
  }

  return (
    <Section
      title="Director filter"
      subtitle={director ? `filter by ${director.name}` : "any director"}
      showArrowRight
      onPress={onOpen}
      {...props}
    />
  );
}
