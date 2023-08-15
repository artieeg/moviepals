import { createStackNavigator } from "@react-navigation/stack";

import { CheckInviteScreen, SCREEN_CHECK_INVITE, SplashScreen } from "~/screens";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_SPLASH = "Splash";

export const NAVIGATOR_ONBOARDING = "Onboarding";
export const NAVIGATOR_MAIN = "Swipe";

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
    </Stack.Navigator>
  );
}
