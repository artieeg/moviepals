import { useEffect } from "react";
import { useNavigationState } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { sendPageView } from "~/utils/plausible";
import {
  CastListScreen,
  DirectorListScreen,
  GenreFilterScreen,
  InviteScreen,
  InviteSuccessScreen,
  MatchListScreen,
  MySwipeListScreen,
  SCREEN_CAST_LIST,
  SCREEN_DIRECTOR_LIST,
  SCREEN_GENRE_FILTER,
  SCREEN_INVITE,
  SCREEN_INVITE_SUCCESS,
  SCREEN_MATCHES_LIST,
  SCREEN_MY_SWIPE_LIST,
  SCREEN_SHARE_PREMIUM,
  SCREEN_STREAMING_SERVICE_LIST,
  SCREEN_THANK_YOU,
  SCREEN_TIMEFRAME_INPUT,
  SharePremiumScreen,
  SplashScreen,
  StreamingServiceList,
  SwipeScreen,
  ThankYouScreen,
  TimeframeInputScreen,
} from "~/screens";
import {
  SCREEN_USER_SETTINGS,
  UserSettingsScreen,
} from "~/screens/UserSettingsScreen";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import { options } from "./options";
import { SCREEN_SWIPE } from "./SwipeNavigator";

const Stack = createStackNavigator();

export const SCREEN_SPLASH = "Splash";

export const NAVIGATOR_ONBOARDING = "Onboarding";
export const NAVIGATOR_MAIN = "Swipe";

export const NAVIGATOR_ROOT = "NavigatorRoot";

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_SPLASH}
        component={SplashScreen}
      />

      <Stack.Screen
        options={options}
        name={NAVIGATOR_ONBOARDING}
        component={OnboardingNavigator}
      />

      <Stack.Screen
        options={options}
        name={NAVIGATOR_MAIN}
        component={MainNavigator}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_SWIPE}
        component={SwipeScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_TIMEFRAME_INPUT}
        component={TimeframeInputScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_DIRECTOR_LIST}
        component={DirectorListScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_CAST_LIST}
        component={CastListScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_GENRE_FILTER}
        component={GenreFilterScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_STREAMING_SERVICE_LIST}
        component={StreamingServiceList}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_INVITE}
        component={InviteScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_INVITE_SUCCESS}
        component={InviteSuccessScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_MY_SWIPE_LIST}
        component={MySwipeListScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_SHARE_PREMIUM}
        component={SharePremiumScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_USER_SETTINGS}
        component={UserSettingsScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_MATCHES_LIST}
        component={MatchListScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_THANK_YOU}
        component={ThankYouScreen}
      />
    </Stack.Navigator>
  );
}
