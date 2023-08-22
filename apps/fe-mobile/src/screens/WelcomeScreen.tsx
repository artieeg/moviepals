import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import appleAuth from "@invertase/react-native-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";
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

      navigation.navigate(SCREEN_WHATS_YOUR_NAME);
    } catch {
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

      navigation.navigate(SCREEN_WHATS_YOUR_NAME);
    } catch {
    } finally {
      setAppleSignInInProgress(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-1">
      <View className="flex-1 px-8">
        <View className="justify-between flex-1 py-8">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl">
              Welcome to{"\n"}MoviePals 👋
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              We got thousands of movies for you and your friends to choose
              from, just create an account and let’s roll 🚀
            </Text>
          </View>

          <Rive
            style={{ width: 300, height: 300 }}
            resourceName="welcome_screen_graphics"
          />

          <View className="space-y-6">
            <View className="space-y-3 flex-row justify-between items-center">
              <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
                Sign in with
              </Text>
              <View className="flex-row space-x-6">
                <IconButton
                  onPress={onSignInWithGoogle}
                  loading={googleSignInInProgress}
                  variant="outline"
                >
                  <GoogleCircle />
                </IconButton>

                <IconButton
                  onPress={onSignInWithApple}
                  loading={appleSignInInProgress}
                  variant="outline"
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
