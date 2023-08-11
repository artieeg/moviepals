import React, {
  PropsWithChildren,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewProps,
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
import WebView from "react-native-webview";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { Cancel, Heart } from "iconoir-react-native";

import { api, RouterOutputs } from "~/utils/api";
import { IconButton } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export function SwipeScreen() {
  const user = api.user.getUserData.useQuery();
  const genres = api.genres.fetchUserGenres.useQuery(undefined, {
    select: (data) =>
      data?.filter((genre) => genre.enabled).map((genre) => genre.id),
  });

  const watchProviders = api.streaming_service.getStreamingServices.useQuery(
    {
      country: user.data!.country,
    },
    {
      select: (data) =>
        data.services
          .filter((s) => s.enabled)
          .map((service) => service.provider_id),
    },
  );

  const result = api.movie_feed.getMovieFeed.useInfiniteQuery(
    {
      genres: genres.data!,
      watchProviderIds: watchProviders.data!,
      region: user.data!.country,
    },
    {
      initialCursor: 0,
      getNextPageParam: (latestResponse) => latestResponse.cursor,
    },
  );

  const [currentMovieIdx, setCurrentMovieIdx] = useState(0);

  const deck = useMemo(() => {
    const currentPage = result.data?.pages[result.data.pages.length - 1];

    return currentPage?.feed.slice(currentMovieIdx, currentMovieIdx + 3);
  }, [result.data?.pages, currentMovieIdx]);

  const movieDetailsRef = useRef<MovieDetailsBottomSheetRef>(null);

  function onOpenMovieDetails() {
    const url = `https://www.themoviedb.org/movie/${deck![0].id}`;

    movieDetailsRef.current?.open(url);
  }

  const currentMovieCard = useRef<MovieCardRef>(null);

  function onLike() {
    currentMovieCard.current?.swipeRight();

    setTimeout(() => setCurrentMovieIdx((prev) => prev + 1), 200);
  }

  function onDislike() {
    currentMovieCard.current?.swipeLeft();

    setTimeout(() => setCurrentMovieIdx((prev) => prev + 1), 200);
  }

  return (
    <>
      <MainLayout title="swipe" canGoBack>
        <View className="aspect-[2/3] translate-y-8">
          {result.isSuccess &&
            deck &&
            deck.map((movie, idx) => (
              <MovieCardContainer
                key={movie.id}
                idx={idx}
                totalNumberOfCards={3}
              >
                <MovieCard
                  ref={idx === 0 ? currentMovieCard : undefined}
                  onSwipe={() => {
                    setCurrentMovieIdx((prev) => prev + 1);
                  }}
                  movie={movie}
                />
              </MovieCardContainer>
            ))}
        </View>

        <View className="mt-8 flex-1 flex-row items-center justify-between space-x-3 px-8">
          <IconButton variant="red" onPress={onDislike}>
            <Cancel color="white" />
          </IconButton>

          <TouchableOpacity
            onPress={onOpenMovieDetails}
            className="bg-neutral-2-10 h-16 flex-1 items-center justify-center rounded-full"
          >
            <Text className="font-primary-bold text-neutral-1">details</Text>
          </TouchableOpacity>

          <IconButton variant="primary" onPress={onLike}>
            <Heart fill="white" color="white" />
          </IconButton>
        </View>
      </MainLayout>
      <MovieDetailsBottomSheet ref={movieDetailsRef} />
    </>
  );
}

function MovieCardContainer({
  idx,
  totalNumberOfCards,
  children,
}: PropsWithChildren<{
  idx: number;
  totalNumberOfCards: number;
}>) {
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

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={rContainerStyle}
      className="absolute bottom-0 left-0 right-0 top-0"
    >
      <View className="flex-1">{children}</View>
    </Animated.View>
  );
}

type MovieCardRef = {
  swipeRight: () => void;
  swipeLeft: () => void;
};

const MovieCard = React.forwardRef<
  MovieCardRef,
  {
    onSwipe: () => void;
    movie: RouterOutputs["movie_feed"]["getMovieFeed"]["feed"][number];
  }
>(({ movie, onSwipe }, ref) => {
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
      if (tx.value > width / 4 || tx.value < -width / 4) {
        tx.value = withSpring(tx.value + 3 * ctx.vx);
        ty.value = withSpring(ty.value + 3 * ctx.vy);

        runOnJS(onSwipe)();
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
    <PanGestureHandler onGestureEvent={handler}>
      <Animated.View style={style} className="aspect-[2/3]">
        <View className="rounded-4xl flex-1 overflow-hidden">
          <FastImage
            resizeMode="cover"
            className="flex-1"
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
                  {movie.vote_average} <Text className="opacity-70">/ 10</Text>
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
  );
});

type MovieDetailsBottomSheetRef = {
  open(url: string): void;
  close(): void;
};

const MovieDetailsBottomSheet = React.forwardRef<
  MovieDetailsBottomSheetRef,
  {}
>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [url, setUrl] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open(url) {
      setUrl(url);
      bottomSheetRef.current?.expand();
    },
    close() {
      setUrl(null);
      bottomSheetRef.current?.collapse();
    },
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const { height } = useWindowDimensions();

  function onClose() {
    setUrl(null);
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={[height * 0.8]}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      {url && <WebView className="flex-1" source={{ uri: url }} />}
    </BottomSheet>
  );
});
