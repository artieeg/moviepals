import { createStackNavigator } from "@react-navigation/stack";

import {
  InviteScreen,
  InviteSuccessScreen,
  MeScreen,
  MySwipeListScreen,
  SCREEN_INVITE,
  SCREEN_INVITE_SUCCESS,
  SCREEN_ME,
  SCREEN_MY_SWIPE_LIST,
  SCREEN_SHARE_PREMIUM,
  SharePremiumScreen,
} from "~/screens";
import {SCREEN_USER_SETTINGS, UserSettingsScreen} from "~/screens/UserSettingsScreen";
import { options } from "./options";

const Stack = createStackNavigator();

export default function MeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen options={options} name={SCREEN_ME} component={MeScreen} />
    </Stack.Navigator>
  );
}
