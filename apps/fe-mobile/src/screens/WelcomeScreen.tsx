import appleAuth from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { IconButton } from "~/components/IconButton";
import { HorrorMovie } from "~/components/icons";
import { env } from "~/utils/env";
import { AppleMac, GoogleCircle } from "iconoir-react-native";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

GoogleSignin.configure({
  webClientId: env.GOOGLE_CLIENT_ID,
});

export function WelcomeScreen() {
  async function onSignInWithGoogle() {
    const r = await GoogleSignin.signIn();

    console.log(r);
  }

  async function onSignInWithApple() {
    const r = await appleAuth.performRequest();

    console.log(r);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-[2] items-center justify-end">
        <HorrorMovie width="80%" height="80%" />
      </View>
      <View className="flex-1 px-8">
        <View className="space-y-6">
          <View className="space-y-2">
            <Text className="font-primary-bold text-2xl text-neutral-1">
              welcome to moviepals
            </Text>
            <Text className="font-primary-regular text-base text-neutral-2">
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
