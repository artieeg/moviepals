import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import appleAuth from "@invertase/react-native-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AppleMac, GoogleCircle } from "iconoir-react-native";

import { api, setAuthToken } from "~/utils/api";
import { env } from "~/utils/env";
import { HorrorMovie } from "~/components/icons";
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

  api.user.findExistingUser.useQuery(
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

      navigation.navigate(SCREEN_WHATS_YOUR_NAME);
    } catch {}
  }

  async function onSignInWithApple() {
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

      navigation.navigate(SCREEN_WHATS_YOUR_NAME);
    } catch {}
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-[2] items-center justify-end">
        <HorrorMovie width="80%" height="80%" />
      </View>
      <View className="flex-1 px-8">
        <View className="space-y-6">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 text-2xl">
              Welcome to MoviePals 🎉
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              It’s here to help you find something to watch together. Please,
              sign in with your Apple or Google account
            </Text>
          </View>
          <View className="flex-row space-x-6">
            <IconButton onPress={onSignInWithGoogle} variant="outline">
              <GoogleCircle />
            </IconButton>

            <IconButton onPress={onSignInWithApple} variant="outline">
              <AppleMac />
            </IconButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
