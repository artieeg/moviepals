import { createStackNavigator } from "@react-navigation/stack";
import { SplashScreen } from "~/screens";
import OnboardingNavigator from "./OnboardingNavigator";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_SPLASH = "Splash";

export const NAVIGATOR_ONBOARDING = "Onboarding";

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
    </Stack.Navigator>
  );
}
