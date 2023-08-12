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
import { useNavigation } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export function StreamingServiceList() {
  const ctx = api.useContext();

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const user = api.user.getUserData.useQuery();

  const enableStreamingServices =
    api.streaming_service.enableStreamingServices.useMutation();

  const navigation = useNavigation();

  function onSaveData() {
    const user = ctx.user.getUserData.getData();

    if (!user) {
      return;
    }

    const streamingServices =
      ctx.streaming_service.getStreamingServices.getData({
        country: user.country,
      });

    if (!streamingServices) {
      return;
    }

    const country = user.country;
    const streamingServiceIds = streamingServices.services
      .filter((item) => item.enabled)
      .map((item) => item.provider_id);

    enableStreamingServices.mutate({ country, streamingServiceIds });

    navigation.goBack();
  }

  /**
   * This function only updates the country locally
   * */
  const onChangeCountry = useCallback((country: Country) => {
    ctx.user.getUserData.setData(
      undefined,
      produce((draft) => {
        if (!draft) {
          return draft;
        }

        draft.country = country.cca2;
      }),
    );
  }, []);

  /**
   * This function only updates the list locally.
   * */
  function onToggleStreamingService(id: number, enabled: boolean) {
    if (!user.data?.country) {
      return;
    }

    ctx.streaming_service.getStreamingServices.setData(
      { country: user.data.country },
      produce((draft) => {
        const item = draft?.services.find((s) => s.provider_id === id);

        if (!item) {
          return draft;
        }

        draft.useAnyService = false;
        item.enabled = enabled;
      }),
    );
  }

  const streamingServices = api.streaming_service.getStreamingServices.useQuery(
    { country: user.data?.country as string },
    {
      enabled: user.isSuccess && !!user.data.country,
      select: (result) => {
        if (debouncedSearch.length > 0) {
          return {
            services: result.services.filter((item) =>
              item.provider_name
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase()),
            ),
            useAnyService: result.useAnyService,
          };
        } else {
          return {
            services: result.services,
            useAnyService: result.useAnyService,
          };
        }
      },
    },
  );

  const anyService = streamingServices.data?.useAnyService;

  function onToggleAnyService() {
    ctx.streaming_service.getStreamingServices.setData(
      { country: user.data?.country as string },
      produce((draft) => {
        if (!draft) {
          return draft;
        }

        draft.useAnyService = !draft.useAnyService;
        draft.services.forEach((item) => {
          item.enabled = false;
        });
      }),
    );
  }

  return (
    <MainLayout onGoBack={onSaveData} canGoBack title="services">
      <FlatList
        className="-mx-8 flex-1"
        data={streamingServices.data?.services}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 128 }}
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
              right="checkbox"
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
                showClearButton
              />

              <ListItem
                itemId="any-service"
                icon="💡"
                title="any service"
                right="checkbox"
                checked={!!anyService}
                onToggle={onToggleAnyService}
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
          right={undefined}
          disabled
          itemId={country}
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
