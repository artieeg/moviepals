import React, { useMemo } from "react";
import { SectionList, Text } from "react-native";
import FastImage from "react-native-fast-image";

import { MovieCollectionGroup } from "@moviepals/api/src/collections";

import { api, RouterOutputs } from "~/utils/api";
import { TouchableScale } from "~/components";
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
          title: "Upgrade to Premium",
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
        sections={sections}
        renderSectionHeader={({ section }) => (
          <Text className="font-primary-bold text-neutral-1 dark:text-white text-xl">
            {section.title}
          </Text>
        )}
        renderItem={({ item, section }) =>
          item.id === "UPGRADE_PROMPT" ? null : (
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
    <TouchableScale>
      <FastImage
        className="h-[74px] w-[74px] rounded-xl"
        resizeMode="cover"
        source={{ uri: image }}
      />
    </TouchableScale>
  );
}
