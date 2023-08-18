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
import { options } from "./options";

const Stack = createStackNavigator();

export default function MeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen options={options} name={SCREEN_ME} component={MeScreen} />
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
    </Stack.Navigator>
  );
}
