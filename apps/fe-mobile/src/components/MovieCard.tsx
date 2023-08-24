import React, { useImperativeHandle } from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import {
  GestureEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { RouterOutputs } from "@moviepals/api";

export type MovieCardRef = {
  swipeRight: () => void;
  swipeLeft: () => void;
};

export const MovieCard = React.forwardRef<
  MovieCardRef,
  {
    onSwipe: (liked: boolean) => void;
    movie: RouterOutputs["movie_feed"]["getMovieFeed"]["feed"][number];
    idx: number;
    totalNumberOfCards: number;
  }
>(({ movie, idx, totalNumberOfCards, onSwipe }, ref) => {
  const scale = useDerivedValue(() => {
    return withSpring(1 - idx * 0.05);
  }, [idx, totalNumberOfCards]);

  const translateY = useDerivedValue(() => {
    return withSpring(-idx * 20);
  }, [idx, totalNumberOfCards]);

  const rContainerStyle = useAnimatedStyle(() => ({
    zIndex: totalNumberOfCards - idx,
    transform: [
      {
        translateY: translateY.value,
      },
      {
        scale: scale.value,
      },
    ],
  }));

  const { width } = useWindowDimensions();
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    swipeRight() {
      tx.value = withSpring(width * 1.5);
    },
    swipeLeft() {
      tx.value = withSpring(-width * 1.5);
    },
  }));

  const handler = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>,
    { vx: number; vy: number }
  >({
    onStart() {},
    onActive(event, ctx) {
      tx.value = event.translationX;
      ty.value = event.translationY;

      ctx.vx = event.velocityX;
      ctx.vy = event.velocityY;
    },
    onEnd(_, ctx) {
      if (tx.value > width / 8 || tx.value < -width / 8) {
        tx.value = withSpring(tx.value + 3 * ctx.vx);
        ty.value = withSpring(ty.value + 3 * ctx.vy);

        runOnJS(onSwipe)(tx.value > 0);
      } else {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    },
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tx.value,
        },
        {
          translateY: ty.value,
        },
        { rotate: `${tx.value / 15}deg` },
      ],
    };
  }, []);

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={rContainerStyle}
      className="absolute bottom-0 left-0 right-0 top-0"
    >
      <View className="flex-1">
        <PanGestureHandler onGestureEvent={handler}>
          <Animated.View style={style} className="aspect-[2/3]">
            <View className="rounded-4xl flex-1 overflow-hidden">
              <FastImage
                resizeMode="cover"
                className="flex-1 bg-white dark:bg-neutral-1"
                source={{ uri: movie.poster_path }}
              />

              <View className="absolute bottom-0 left-0 right-0 top-0 justify-end ">
                <LinearGradient
                  colors={["#000000FF", "#00000000"]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0.6 }}
                  className="absolute bottom-0 left-0 right-0 top-0"
                />
                <View className="space-y-3 px-4 pb-8">
                  <View className="space-y-1">
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className="font-primary-bold text-base text-white"
                    >
                      {movie.vote_average}{" "}
                      <Text className="opacity-70">/ 10</Text>
                    </Text>

                    <View>
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        className="font-primary-bold text-2xl text-white"
                      >
                        {movie.title}
                      </Text>

                      <Text
                        numberOfLines={3}
                        ellipsizeMode="tail"
                        className="font-primary-bold text-sm text-white opacity-70"
                      >
                        {movie.overview}
                      </Text>
                    </View>
                  </View>

                  {movie.likedByFriends && (
                    <View className="flex-row items-center justify-between">
                      <Text className="font-primary-bold text-base text-white">
                        liked by friends
                      </Text>

                      <TouchableOpacity
                        className="bg-neutral-2-50 items-center justify-center rounded-full px-8 py-2"
                        activeOpacity={0.8}
                      >
                        <Text className="font-primary-bold text-base text-white">
                          see who
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Animated.View>
  );
});
