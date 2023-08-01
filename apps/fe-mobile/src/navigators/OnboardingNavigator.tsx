import { createStackNavigator } from "@react-navigation/stack";
import { WelcomeScreen } from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_WELCOME = "Welcome";

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_WELCOME}
        component={WelcomeScreen}
      />
    </Stack.Navigator>
  );
}
