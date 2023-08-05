import React, { useCallback, useMemo } from "react";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { Search } from "iconoir-react-native";
import { produce } from "immer";
import countries from "world-countries";

import { api } from "~/utils/api";
import { Input, ListItem } from "~/components";
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

  return (
    <MainLayout canGoBack title="services">
      <View className="space-y-8">
        {user.isSuccess && (
          <YourCountry
            country={user.data.country}
            onChangeCountry={onChangeCountry}
          />
        )}
        <StreamingServicesHeader />
      </View>
    </MainLayout>
  );
}

function StreamingServicesHeader(props: ViewProps) {
  return (
    <View className="space-y-6">
      <View className="space-y-1" {...props}>
        <Text className="font-primary-bold text-neutral-1 text-xl">
          streaming services
        </Text>
        <Text className="font-primary-regular text-neutral-2 text-base">
          select the services you use, this will make the app more relevant to
          you & your friends
        </Text>
      </View>

      <Input icon={<Search />} placeholder="search" />
    </View>
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
