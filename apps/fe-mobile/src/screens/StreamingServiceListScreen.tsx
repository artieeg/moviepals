import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import FastImage from "react-native-fast-image";
import { Search } from "iconoir-react-native";
import { produce } from "immer";
import { useDebounce } from "use-debounce";
import countries from "world-countries";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import { Input, ListItem, LoadingIndicator } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export function StreamingServiceList() {
  const ctx = api.useContext();
  const setUserCountry = api.user.setUserCountry.useMutation({
    onMutate({ country }) {
      ctx.user.getUserData.setData(
        undefined,
        produce((draft) => {
          if (!draft) {
            return draft;
          }

          draft.country = country;
        }),
      );
    },
  });

  const user = api.user.getUserData.useQuery();

  const onChangeCountry = useCallback((country: Country) => {
    setUserCountry.mutate({ country: country.cca2 });
  }, []);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  function onToggleStreamingService(id: string, enabled: boolean) {}

  const streamingServices = api.streaming_service.getStreamingServices.useQuery(
    { country: user.data?.country as string },
    {
      enabled: user.isSuccess && !!user.data.country,
      select: (result) => {
        if (debouncedSearch.length > 0) {
          return result.services.filter((item) =>
            item.provider_name
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase()),
          );
        } else {
          return result.services;
        }
      },
    },
  );

  return (
    <MainLayout canGoBack title="services">
      <FlatList
        className="-mx-4 flex-1"
        data={streamingServices.data}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => {
          return (
            <ListItem
              icon={
                <FastImage
                  className="h-full w-full"
                  source={{ uri: getTMDBStaticUrl(item.logo_path) }}
                />
              }
              itemId={item.provider_id}
              title={item.provider_name}
              checkbox
              checked={item.enabled}
              onToggle={onToggleStreamingService}
            />
          );
        }}
        ListFooterComponent={() => {
          if (!streamingServices.isLoading) {
            return null;
          }

          return (
            <View className="py-12">
              <LoadingIndicator />
            </View>
          );
        }}
        ListHeaderComponent={
          <View className="mb-4 space-y-8">
            {user.isSuccess && (
              <YourCountry
                country={user.data.country}
                onChangeCountry={onChangeCountry}
              />
            )}

            <View className="space-y-6">
              <View className="space-y-1">
                <Text className="font-primary-bold text-neutral-1 text-xl">
                  streaming services
                </Text>
                <Text className="font-primary-regular text-neutral-2 text-base">
                  select the services you use, this will make the app more
                  relevant to you & your friends
                </Text>
              </View>

              <Input
                icon={<Search />}
                placeholder="search"
                value={search}
                onChangeText={(v) => setSearch(v)}
              />
            </View>
          </View>
        }
      />
    </MainLayout>
  );
}

function YourCountry({
  onChangeCountry,
  country,
  ...props
}: ViewProps & {
  country: string;
  onChangeCountry: (country: Country) => void;
}) {
  const [showCountryPicker, setShowCountryPicker] = React.useState(false);

  const countryData = useMemo(
    () => countries.find((c) => c.cca2 === country),
    [country],
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          setShowCountryPicker(true);
        }}
        className="space-y-3"
        {...props}
      >
        <View className="space-y-1">
          <Text className="font-primary-bold text-neutral-1 text-xl">
            your country
          </Text>
          <Text className="font-primary-regular text-neutral-2 text-base">
            we will fetch a list of streaming services for this country
          </Text>
        </View>

        <ListItem
          disabled
          checkbox={false}
          id={country}
          title={countryData?.name.common ?? "..."}
          icon={countryData?.flag}
        />
      </TouchableOpacity>

      <View className="absolute">
        <CountryPicker
          theme={{
            fontFamily: "Nunito-Regular",
            flagSizeButton: 32,
            fontSize: 20,
          }}
          withFilter
          countryCode={country as CountryCode}
          withCountryNameButton={false}
          withFlagButton={false}
          withEmoji={false}
          onClose={() => {
            setShowCountryPicker(false);
          }}
          onSelect={onChangeCountry}
          visible={showCountryPicker}
        />
      </View>
    </View>
  );
}
