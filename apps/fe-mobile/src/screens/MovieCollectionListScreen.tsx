import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SectionList,
  Text,
  View,
  ViewProps,
} from "react-native";
import FastImage from "react-native-fast-image";
import {
  AdsConsent,
  AdsConsentStatus,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import Purchases from "react-native-purchases";
import Animated from "react-native-reanimated";
import { Filter, Lock } from "iconoir-react-native";
import { useColorScheme } from "nativewind";

import { api, RouterOutputs } from "~/utils/api";
import { env } from "~/utils/env";
import { Button, TouchableScale } from "~/components";
import { useNavigation, usePremiumProduct } from "~/hooks";
import {
  SCREEN_PREPARE_SWIPE,
  SCREEN_SWIPE,
} from "~/navigators/SwipeNavigator";
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

const ad = Platform.select({
  ios: env.REWARDED_AD_IOS,
  default: env.REWARDED_AD_ANDROID,
});

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
  const user = api.user.getMyData.useQuery();

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

  const unlockCollection = api.collections.unlockCollection.useMutation({
    onSuccess() {
      collectionData.refetch();
    },
  });

  const [loadingAdFor, setLoadingAdFor] = React.useState<string | null>(null);

  async function onWatchRewardedAd(collectionId: string) {
    setLoadingAdFor(collectionId);
    const consentInfo = await AdsConsent.requestInfoUpdate();

    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdsConsentStatus.REQUIRED
    ) {
      await AdsConsent.showForm();

      const { storeAndAccessInformationOnDevice } =
        await AdsConsent.getUserChoices();

      if (!storeAndAccessInformationOnDevice) {
        Alert.alert(
          "Unable to show a rewarded ad",
          "We're unable to show rewarded ads without your consent. Please consider updating your response or purchasing premium",
        );

        setLoadingAdFor(null);

        return;
      }
    }

    const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

    if (result === RESULTS.DENIED) {
      await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    }

    const rewarded = RewardedAd.createForAdRequest(ad, {
      serverSideVerificationOptions: {
        userId: user.data?.id,
      },
    });

    const watchedUnsub = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        watchedUnsub();

        unlockCollection.mutate({ collectionId });
      },
    );

    const loadedUnsub = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("loaded");
        loadedUnsub();
        setLoadingAdFor(null);

        rewarded.show();
      },
    );

    rewarded.load();
  }

  const onCollectionPress = (collection: Collection) => {
    if (collection.locked) {
      onWatchRewardedAd(collection.id);
      //TODO: show modal
    } else {
      useFilterStore.setState({
        ...collection.filters,
      });

      navigation.navigate(SCREEN_SWIPE);
    }
  };

  const { handler, tweener } = useTabLayoutScrollHandler();

  function onOpenCustomFilters() {
    if (!isPaid.isSuccess) {
      return;
    }

    if (!isPaid.data.isPaid) {
      Alert.alert(
        "Premium Feature",
        "Hey, this is a premium feature! Upgrade to unlock it.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Upgrade",
            onPress: () => {
              onPurchasePremium();
            },
          },
        ],
      );
    } else {
      useFilterStore.setState({
        custom_filters: true,
      })

      navigation.navigate(SCREEN_PREPARE_SWIPE);
    }
  }

  return (
    <TabLayout
      borderTweenerValue={tweener}
      subtitle="Select a collection and find movies to
watch together with your friends"
      title="Movie Collections"
    >
      <AnimatedSectionList
        className="-mx-8"
        showsVerticalScrollIndicator={false}
        contentInset={{ top: 16 }}
        sections={sections}
        stickySectionHeadersEnabled={false}
        onScroll={handler}
        renderSectionFooter={({ section }: any) => (
          <View className="pb-8">
            {section.id === "recommended" && (
              <CustomFilters onPress={onOpenCustomFilters} className="mt-3" />
            )}
          </View>
        )}
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
              isLoading={loadingAdFor === item.id}
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
      <Button onPress={onPurchasePremium} isLoading={isPurchasingPremium}>
        Upgrade to Pro
      </Button>
      <Button onPress={onInvitePeople} kind="outline">
        Invite Friends
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

function CustomFilters({
  onPress,
  ...rest
}: { onPress: () => void } & ViewProps) {
  return (
    <TouchableScale className="flex-row space-x-4" onPress={onPress} {...rest}>
      <View className="h-[74px] rounded-xl w-[74px] bg-neutral-2-10 justify-center items-center">
        <Filter />
      </View>

      <View className="space-y-1 flex-1">
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-xl">
          Custom Collection
        </Text>
        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
          Filter by genres, cast, directors & more
        </Text>
      </View>
    </TouchableScale>
  );
}

const MovieCollection = React.memo(_MovieCollection);

function _MovieCollection({
  collection,
  onPress,
  isLoading,
}: {
  collection: Collection;
  isLoading: boolean;
  onPress: (collection: Collection) => void;
}) {
  const { image, title, description, locked } = collection;

  return (
    <TouchableScale
      className="flex-row space-x-4"
      onPress={() => onPress(collection)}
    >
      <View className="h-[74px] w-[74px] rounded-xl overflow-hidden">
        <FastImage
          className="rounded-xl h-full w-full"
          resizeMode="cover"
          source={{ uri: image }}
        />

        {locked && (
          <View className="absolute left-0 top-0 bottom-0 right-0 bg-[#0000004D] items-center justify-center">
            {isLoading ? <ActivityIndicator color="white" /> : <Lock />}
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
