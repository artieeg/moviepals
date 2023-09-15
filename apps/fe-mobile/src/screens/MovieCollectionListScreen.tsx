import React, { useMemo } from "react";
import { SectionList, Text, View, ViewProps } from "react-native";
import FastImage from "react-native-fast-image";
import { Lock } from "iconoir-react-native";

import { api, RouterOutputs } from "~/utils/api";
import { Button, TouchableScale } from "~/components";
import { TabLayout } from "./layouts/TabLayout";

export const SCREEN_MOVIE_COLLECTION_LIST_SCREEN = "MovieCollectionListScreen";

type SectionData =
  | RouterOutputs["collections"]["getCollectionList"]["groups"][number]
  | "UPGRADE_PROMPT";

export function MovieCollectionList() {
  const isPaid = api.user.isPaid.useQuery();
  const collectionData = api.collections.getCollectionList.useQuery();

  const sections = useMemo(() => {
    if (!collectionData.isSuccess || !isPaid.isSuccess) {
      return [];
    }

    let items: SectionData[] = collectionData.data.groups;

    if (!isPaid.data.isPaid) {
      items.splice(2, 0, "UPGRADE_PROMPT");
    }

    return items.map((group) => {
      if (group === "UPGRADE_PROMPT") {
        return {
          id: "UPGRADE_PROMPT",
          title: "Unlock All",
          description: "Get access to all collections",
          data: [],
        };
      }

      return {
        id: group.id,
        title: group.title,
        description: group.description,
        data: group.collections,
      };
    });
  }, [collectionData.data?.groups, collectionData.isSuccess]);

  return (
    <TabLayout
      subtitle="Select a collection and find movies to
watch together with your friends"
      title="Movie Collections"
    >
      <SectionList
        className="-mx-8"
        contentInset={{ top: 32 }}
        sections={sections}
        stickySectionHeadersEnabled={false}
        renderSectionFooter={() => <View className="h-8" />}
        renderSectionHeader={({ section }) => (
          <View className="space-y-2 mb-3">
            <Text className="font-primary-bold text-neutral-1 dark:text-white text-xl">
              {section.title}
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              {section.description}
            </Text>

            {section.id === "UPGRADE_PROMPT" && (
              <UpgradeSection className="mt-3" />
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item, section }) =>
          section.id === "UPGRADE_PROMPT" ? null : (
            <MovieCollection
              onPress={() => {}}
              key={`${section.id}_${item.id}`}
              title={item.title}
              image={item.image}
              description={item.description}
              locked={item.locked}
            />
          )
        }
      />
    </TabLayout>
  );
}

function UpgradeSection({ ...rest }: ViewProps) {
  return (
    <View className="space-y-3" {...rest}>
      <Button kind="outline">Invite Friends</Button>
      <Button>Upgrade to Pro</Button>
    </View>
  );
}

function MovieCollection({
  title,
  image,
  description,
  locked,
  onPress,
}: {
  title: string;
  description: string;
  image: string;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableScale className="flex-row space-x-4">
      <View className="h-[74px] w-[74px]">
        <FastImage
          className="rounded-xl h-full w-full"
          resizeMode="cover"
          source={{ uri: image }}
        />

        <View className="absolute left-0 top-0 bottom-0 right-0 bg-[#0000004D] items-center justify-center">
          <Lock />
        </View>
      </View>

      <View className="space-y-1 flex-1">
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-xl">
          {title}
        </Text>
        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
          {description}
        </Text>
      </View>
    </TouchableScale>
  );
}
