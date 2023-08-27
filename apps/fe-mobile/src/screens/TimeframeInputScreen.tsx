import React from "react";
import { ScrollView, View } from "react-native";

import { Button, ListItem, ListItemProps } from "~/components";
import { useNavigation } from "~/hooks";
import { useFilterStore } from "~/stores";
import { MainLayout } from "./layouts/MainLayout";

export const supportedTimeframes = [
  {
    itemId: "2010s",
    start: 2010,
    end: 2019,
    title: "2010s",
    subtitle: "2010 - 2019",
  },
  {
    itemId: "00s",
    start: 2000,
    end: 2009,
    title: "2000s",
    subtitle: "2000 - 2009",
  },
  {
    itemId: "90s",
    start: 1990,
    end: 1999,
    title: "90s",
    subtitle: "1990 - 1999",
  },
  {
    itemId: "80s",
    start: 1980,
    end: 1989,
    title: "80s",
    subtitle: "1980 - 1989",
  },
  {
    itemId: "70s",
    start: 1970,
    end: 1979,
    title: "70s",
    subtitle: "1970 - 1979",
  },
  {
    itemId: "60s",
    start: 1960,
    end: 1969,
    title: "60s",
    subtitle: "1960 - 1969",
  },
];

export const SCREEN_TIMEFRAME_INPUT = "TimeframeInputScreen";

export function TimeframeInputScreen() {
  const navigation = useNavigation();

  function onDone() {
    navigation.goBack();
  }

  const selected = useFilterStore((state) => state.timeframeId);

  function onClear() {
    useFilterStore.setState({
      timeframeId: undefined,
      startYear: undefined,
      endYear: undefined,
    });
  }

  function onSelect(id: string, start: number, end: number) {
    useFilterStore.setState({
      timeframeId: id,
      startYear: start,
      endYear: end,
    });
  }

  return (
    <MainLayout canGoBack onGoBack={onDone} title="Release date">
      <ScrollView
        className="-mx-8 flex-1"
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 64 }}
      >
        <View className="space-y-6">
          <DurationOption
            key={"any"}
            start={0}
            end={0}
            title="Any year"
            itemId="any"
            right="radio"
            checked={!selected}
            onSelect={() => onClear() as any}
            onToggle={() => onClear() as any}
          />

          {supportedTimeframes.map((option) => (
            <DurationOption
              key={option.itemId}
              {...option}
              right="radio"
              checked={selected === option.itemId}
              onSelect={onSelect}
              onToggle={() => {}}
            />
          ))}
        </View>
      </ScrollView>
      <Button onPress={onDone} className="absolute bottom-0 left-8 right-8">
        done
      </Button>
    </MainLayout>
  );
}

function DurationOption({
  start,
  end,
  onSelect,
  ...rest
}: {
  start: number;
  end: number;
  onSelect: (id: string, start: number, end: number) => void;
} & ListItemProps) {
  return (
    <ListItem
      {...(rest as any)}
      onPress={() => onSelect(rest.itemId, start, end)}
      onToggle={() => onSelect(rest.itemId, start, end)}
    />
  );
}
