import React from "react";
import { Text, View, ViewProps } from "react-native";
import { BrightStar } from "iconoir-react-native";

import { useCanServeAds } from "~/hooks";
import { Button } from "./Button";

export function RanOutOfSwipes(props: ViewProps) {
  const canServeAds = useCanServeAds();

  return (
    <View className="flex-1" {...props}>
      <View className="items-center justify-center space-y-4">
        <View className="bg-brand-1-10 h-20 w-20 items-center justify-center rounded-2xl">
          <BrightStar color="#6867AA" fill="#6867AA" width={32} height={32} />
        </View>

        <View className="items-center justify-center space-y-2">
          <Text className="font-primary-bold text-xl">
            Hey, slow down a little 😅
          </Text>
          <Text className="font-primary-regular text-neutral-2 text-center text-base">
            {canServeAds.data === true ? (
              <>
                You’ve ran out of swipes for the day. Watch a short ad and get
                extra swipes or buy premium for unlimited access (you can share
                it with up to 4 friends 🙌 )
              </>
            ) : (
              <>
                You’ve ran out of swipes for the day. Buy premium for unlimited
                access (you can share it with up to 4 friends 🙌 )
              </>
            )}
          </Text>
        </View>
      </View>
      <View className="flex-1 justify-end space-y-3">
        <Button onPress={() => {}}>get premium for $5.99</Button>
        <Button kind="outline" onPress={() => {}}>watch a rewarded ad</Button>
      </View>
    </View>
  );
}
