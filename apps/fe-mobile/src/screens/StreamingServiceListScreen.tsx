import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
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

import { StreamingService } from "@moviepals/api";

import { api } from "~/utils/api";
import { getTMDBStaticUrl } from "~/utils/uri";
import { Button, Input, ListItem, LoadingIndicator } from "~/components";
import { useNavigation } from "~/hooks";
import { useFilterStore } from "~/stores";
import { MainLayout } from "./layouts/MainLayout";

export function StreamingServiceList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const country = useFilterStore((state) => state.country);

  const enabledStreamingServices = useFilterStore(
    (state) => state.streamingServices,
  );
  const anyService = enabledStreamingServices.length === 0;

  const navigation = useNavigation();

  function onSaveData() {
    navigation.goBack();
  }

  /**
   * This function only updates the country locally
   * */
  const onChangeCountry = useCallback((country: Country) => {
    useFilterStore.setState({
      country: country.cca2,
    });
  }, []);

  /**
   * This function only updates the list locally.
   * */
  function onToggleStreamingService(service: StreamingService) {
    useFilterStore.getState().toggleStreamingService(service);
  }

  const streamingServices = api.streaming_service.getStreamingServices.useQuery(
    { country },
    {
      enabled: !!country,
      select: (result) => {
        if (debouncedSearch.length > 0) {
          return {
            services: result.services.filter((item) =>
              item.provider_name
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase()),
            ),
          };
        } else {
          return {
            services: result.services,
          };
        }
      },
    },
  );

  function onToggleAnyService() {
    useFilterStore.setState({
      streamingServices: [],
    });
  }

  function onDone() {
    navigation.goBack();
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
              checked={enabledStreamingServices.some(
                (s) => s.provider_id === item.provider_id,
              )}
              onToggle={() => onToggleStreamingService(item)}
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
            <YourCountry country={country} onChangeCountry={onChangeCountry} />

            <View className="space-y-6">
              <View className="space-y-1">
                <Text className="font-primary-bold text-neutral-1 text-xl">
                  Services available
                </Text>
                <Text className="font-primary-regular text-neutral-2 text-base">
                  Select the services you use. Powered by{" "}
                  <Pressable
                    onPress={() => Linking.openURL("https://www.justwatch.com")}
                    className={Platform.select({
                      ios: "translate-y-0.5",
                      default: "translate-y-[7px]",
                    })}
                  >
                    <Text className="font-primary-regular text-neutral-2 text-base underline">
                      justwatch.com
                    </Text>
                  </Pressable>{" "}
                  and{" "}
                  <Pressable
                    onPress={() =>
                      Linking.openURL("https://www.themoviedb.org")
                    }
                    className={Platform.select({
                      ios: "translate-y-0.5",
                      default: "translate-y-[7px]",
                    })}
                  >
                    <Text className="font-primary-regular text-neutral-2 text-base underline">
                      themoviedb.org
                    </Text>
                  </Pressable>
                  .
                </Text>
              </View>

              <Input
                icon={<Search />}
                placeholder="search"
                value={search}
                onChangeText={(v) => setSearch(v)}
                showClearButton
              />

              <View>
                <ListItem
                  itemId="any-service"
                  icon="💡"
                  title="any service"
                  right="radio"
                  checked={!!anyService}
                  onToggle={onToggleAnyService}
                />

                <View className="border-neutral-4 h-4 border-b" />
              </View>
            </View>
          </View>
        }
      />

      <Button onPress={onDone} className="absolute bottom-0 left-8 right-8">
        done
      </Button>
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
