import { createStackNavigator } from "@react-navigation/stack";

import {
  CheckInviteScreen,
  JoinMailingListScreen,
  NotificationPermissionRequestScreen,
  SCREEN_CHECK_INVITE,
  SCREEN_JOIN_MAILING_LIST,
  SCREEN_NOTIFICATION_PERMISSION,
  WelcomeScreen,
  WhatsYourNameScreen,
} from "~/screens";
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

      <Stack.Screen
        options={options}
        name={SCREEN_CHECK_INVITE}
        component={CheckInviteScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_NOTIFICATION_PERMISSION}
        component={NotificationPermissionRequestScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_JOIN_MAILING_LIST}
        component={JoinMailingListScreen}
      />
    </Stack.Navigator>
  );
}
