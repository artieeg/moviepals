import React from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { SafeAreaView } from "react-native-safe-area-context";
import appleAuth from "@invertase/react-native-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { FlashList } from "@shopify/flash-list";
import { AppleMac, GoogleCircle } from "iconoir-react-native";
import Rive from "rive-react-native";

import { api, setAuthToken } from "~/utils/api";
import { env } from "~/utils/env";
import { IconButton } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_WHATS_YOUR_NAME } from "~/navigators/OnboardingNavigator";
import { NAVIGATOR_MAIN } from "~/navigators/RootNavigator";
import { useOnboardingStore } from "~/stores";

GoogleSignin.configure({
  webClientId: env.GOOGLE_CLIENT_ID,
});

export function WelcomeScreen() {
  const navigation = useNavigation();

  const method = useOnboardingStore((state) => state.method);
  const [googleSignInInProgress, setGoogleSignInInProgress] =
    React.useState(false);
  const [appleSignInInProgress, setAppleSignInInProgress] =
    React.useState(false);

  api.user.signIn.useQuery(
    { method: method! },
    {
      enabled: !!method,
      onError(e) {
        //If user doesn't exist, navigate to onboarding
        if (e.data?.code === "NOT_FOUND") {
          navigation.navigate(SCREEN_WHATS_YOUR_NAME);
        }
      },
      onSuccess({ token }) {
        setAuthToken(token);

        navigation.replace(NAVIGATOR_MAIN);
      },
    },
  );

  async function onSignInWithGoogle() {
    try {
      setGoogleSignInInProgress(true);
      const r = await GoogleSignin.signIn();

      if (!r.idToken) {
        return;
      }

      useOnboardingStore.setState({
        name: r.user.givenName,
        method: {
          provider: "google",
          idToken: r.idToken,
        },
      });
    } catch (e) {
    } finally {
      setGoogleSignInInProgress(false);
    }
  }

  async function onSignInWithApple() {
    setAppleSignInInProgress(true);
    try {
      let appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthResponse.email) {
        const storedAppleAuth = await AsyncStorage.getItem("@apple-auth");

        if (storedAppleAuth) {
          appleAuthResponse = JSON.parse(storedAppleAuth) as any;
        }
      } else {
        AsyncStorage.setItem("@apple-auth", JSON.stringify(appleAuthResponse));
      }

      if (!appleAuthResponse.identityToken) {
        return;
      }

      useOnboardingStore.setState({
        name: appleAuthResponse.fullName?.givenName,
        method: {
          provider: "apple",
          idToken: appleAuthResponse.identityToken,
          nonce: appleAuthResponse.nonce,
        },
      });
    } catch {
    } finally {
      setAppleSignInInProgress(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-1-6">
      <View className="flex-1 px-8">
        <View className="justify-between flex-1 py-8">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl">
              Welcome to{"\n"}MoviePals 👋
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              Discover dozens of movies that you and your friends want to watch together!
            </Text>
          </View>

          <View className="max-h-[300px] overflow-hidden rounded-4xl">
            <FastImage
              source={require("../../assets/pngs/watching-movie-art.png")}
              className="w-full aspect-square"
            />
          </View>

          <View className="space-y-6">
            <View className="flex-row justify-between items-center">
              <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
                Sign in with
              </Text>
              <View className="flex-row space-x-6">
                <IconButton
                  onPress={onSignInWithGoogle}
                  loading={googleSignInInProgress}
                  variant="gray"
                >
                  <GoogleCircle />
                </IconButton>

                <IconButton
                  onPress={onSignInWithApple}
                  loading={appleSignInInProgress}
                  variant="gray"
                >
                  <AppleMac />
                </IconButton>
              </View>
            </View>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-sm">
              By continuing, you agree to our{" "}
              <Pressable
                className="translate-y-[3px]"
                onPress={() => {
                  Linking.openURL("https://moviepals.io/privacy-policy");
                }}
              >
                <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-sm underline">
                  Privacy Policy
                </Text>
              </Pressable>{" "}
              and{" "}
              <Pressable
                className="translate-y-[3px]"
                onPress={() => {
                  Linking.openURL("https://moviepals.io/terms-of-service");
                }}
              >
                <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-sm underline">
                  Terms of Service
                </Text>
              </Pressable>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
