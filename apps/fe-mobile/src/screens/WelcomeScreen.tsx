import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import appleAuth from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AppleMac, GoogleCircle } from "iconoir-react-native";

import { env } from "~/utils/env";
import { HorrorMovie } from "~/components/icons";
import { IconButton } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_WHATS_YOUR_NAME } from "~/navigators/OnboardingNavigator";
import { useOnboardingStore } from "~/stores";

GoogleSignin.configure({
  webClientId: env.GOOGLE_CLIENT_ID,
});

export function WelcomeScreen() {
  const navigation = useNavigation();

  async function onSignInWithGoogle() {
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
  }

  async function onSignInWithApple() {
    const r = await appleAuth.performRequest();

    if (!r.identityToken) {
      return;
    }

    useOnboardingStore.setState({
      name: r.fullName?.givenName,
      method: {
        provider: "apple",
        idToken: r.identityToken,
        nonce: r.nonce,
      },
    });

    navigation.navigate(SCREEN_WHATS_YOUR_NAME);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-[2] items-center justify-end">
        <HorrorMovie width="80%" height="80%" />
      </View>
      <View className="flex-1 px-8">
        <View className="space-y-6">
          <View className="space-y-2">
            <Text className="font-primary-bold text-neutral-1 text-2xl">
              welcome to moviepals
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              it’s here to help you find something to watch together, please
              create an account using apple or google
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
