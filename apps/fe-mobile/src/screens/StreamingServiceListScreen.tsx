import React from "react";
import {Text, View, ViewProps} from "react-native";

import { MainLayout } from "./layouts/MainLayout";

export function StreamingServiceList() {
  return (<MainLayout canGoBack title="services">
    <View className="space-y-8">
      <CountryPicker />
      <StreamingServicesHeader />
    </View>
  </MainLayout>);
}

function StreamingServicesHeader(props: ViewProps) {
  return (
      <View className="space-y-1" {...props}>
        <Text className="font-primary-bold text-neutral-1 text-xl">
          streaming services
        </Text>
        <Text className="font-primary-regular text-neutral-2 text-base">
          select the services you use, this will make the app more relevant to you & your friends
        </Text>
      </View>
  )
}

function CountryPicker(props: ViewProps) {
  return (
    <View className="space-y-3" {...props}>
      <View className="space-y-1">
        <Text className="font-primary-bold text-neutral-1 text-xl">
          your country
        </Text>
        <Text className="font-primary-regular text-neutral-2 text-base">
          we will fetch a list of streaming services for this country
        </Text>
      </View>
    </View>
  )
}
