import React, { useMemo } from "react";
import { Alert, SectionList, Text, View, ViewProps } from "react-native";
import FastImage from "react-native-fast-image";
import Purchases from "react-native-purchases";
import Animated from "react-native-reanimated";
import { Lock } from "iconoir-react-native";

import { MovieBaseFilter } from "@moviepals/filters";

import { api, RouterOutputs } from "~/utils/api";
import { Button, TouchableScale } from "~/components";
import { useNavigation, usePremiumProduct } from "~/hooks";
import { SCREEN_SWIPE } from "~/navigators/SwipeNavigator";
import { useFilterStore } from "~/stores";
import { SCREEN_INVITE } from "./InviteScreen";
import { TabLayout, useTabLayoutScrollHandler } from "./layouts/TabLayout";
import { SCREEN_THANK_YOU } from "./ThankYouScreen";

export const SCREEN_MOVIE_COLLECTION_LIST_SCREEN = "MovieCollectionListScreen";

type Collection =
  RouterOutputs["collections"]["getCollectionList"]["groups"][number]["collections"][number];

type SectionData =
  | RouterOutputs["collections"]["getCollectionList"]["groups"][number]
  | "UPGRADE_PROMPT";

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

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

  const premium = usePremiumProduct();

  const [isRestoringPurchases, setRestoringPurchases] = React.useState(false);
  const [isPurchasingPremium, setPurchasingPremium] = React.useState(false);

  const navigation = useNavigation();

  function onInvitePeople() {
    navigation.navigate(SCREEN_INVITE);
  }

  async function onRestorePurchases() {
    setRestoringPurchases(true);

    try {
      await Purchases.restorePurchases();

      setTimeout(() => {
        isPaid.refetch();
        collectionData.refetch();

        setRestoringPurchases(false);
      }, 400);

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      Alert.alert(
        "Purchases not found",
        "Is this a mistake? Contact us: hey@moviepals.io",
      );
    } finally {
      setRestoringPurchases(false);
    }
  }

  async function onPurchasePremium() {
    if (!premium.data?.product.identifier) {
      return;
    }

    setPurchasingPremium(true);

    try {
      await Purchases.purchaseStoreProduct(premium.data.product);

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        isPaid.refetch();
        collectionData.refetch();

        setPurchasingPremium(false);
      }, 1000);
    }
  }

  const onCollectionPress = (collection: Collection) => {
    if (collection.locked) {
      //TODO: show modal
    } else {
      useFilterStore.setState({
        ...collection.filters,
      });

      navigation.navigate(SCREEN_SWIPE);
    }
  };

  const { handler, tweener } = useTabLayoutScrollHandler();

  return (
    <TabLayout
      borderTweenerValue={tweener}
      subtitle="Select a collection and find movies to
watch together with your friends"
      title="Movie Collections"
    >
      <AnimatedSectionList
        className="-mx-8"
        contentInset={{ top: 16 }}
        sections={sections}
        stickySectionHeadersEnabled={false}
        onScroll={handler}
        renderSectionFooter={() => <View className="h-8" />}
        renderSectionHeader={({ section }: any) => (
          <View className="space-y-1 mb-3">
            <Text className="font-primary-bold text-neutral-1 dark:text-white text-xl">
              {section.title}
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              {section.description}
            </Text>

            {section.id === "UPGRADE_PROMPT" && (
              <View className="pt-3">
                <UpgradeSection
                  isPurchasingPremium={isPurchasingPremium}
                  isRestoringPurchases={isRestoringPurchases}
                  onPurchasePremium={onPurchasePremium}
                  onInvitePeople={onInvitePeople}
                  onRestorePurchases={onRestorePurchases}
                />
              </View>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item, section }: any) =>
          section.id === "UPGRADE_PROMPT" ? null : (
            <MovieCollection
              onPress={onCollectionPress}
              key={`${section.id}_${item.id}`}
              collection={item}
            />
          )
        }
      />
    </TabLayout>
  );
}

function UpgradeSection({
  isPurchasingPremium,
  isRestoringPurchases,
  onRestorePurchases,
  onPurchasePremium,
  onInvitePeople,
  ...rest
}: ViewProps & {
  isPurchasingPremium: boolean;
  isRestoringPurchases: boolean;
  onRestorePurchases: () => void;
  onPurchasePremium: () => void;
  onInvitePeople: () => void;
}) {
  return (
    <View className="space-y-3" {...rest}>
      <Button onPress={onInvitePeople} kind="outline">
        Invite Friends
      </Button>
      <Button onPress={onPurchasePremium} isLoading={isPurchasingPremium}>
        Upgrade to Pro
      </Button>
      <Button
        onPress={onRestorePurchases}
        kind="text"
        isLoading={isRestoringPurchases}
      >
        Restore Purchases
      </Button>
    </View>
  );
}

const MovieCollection = React.memo(_MovieCollection);

function _MovieCollection({
  collection,
  onPress,
}: {
  collection: Collection;
  onPress: (collection: Collection) => void;
}) {
  const { image, title, description, locked } = collection;

  return (
    <TouchableScale
      className="flex-row space-x-4"
      onPress={() => onPress(collection)}
    >
      <View className="h-[74px] w-[74px]">
        <FastImage
          className="rounded-xl h-full w-full"
          resizeMode="cover"
          source={{ uri: image }}
        />

        {locked && (
          <View className="absolute left-0 top-0 bottom-0 right-0 bg-[#0000004D] items-center justify-center">
            <Lock />
          </View>
        )}
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
