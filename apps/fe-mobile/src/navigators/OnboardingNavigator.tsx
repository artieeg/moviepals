import { createStackNavigator } from "@react-navigation/stack";

import { WelcomeScreen, WhatsYourNameScreen } from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_WELCOME = "Welcome";
export const SCREEN_WHATS_YOUR_NAME = "WhatsYourName";

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_WELCOME}
        component={WelcomeScreen}
      />
      <Stack.Screen
        options={options}
        name={SCREEN_WHATS_YOUR_NAME}
        component={WhatsYourNameScreen}
      />
    </Stack.Navigator>
  );
}
