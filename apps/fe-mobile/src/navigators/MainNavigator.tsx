import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { BottomTabBar } from "~/components";
import { options } from "./options";
import SwipeNavigator from "./SwipeNavigator";

const Tabs = createBottomTabNavigator();

export const SCREEN_WELCOME = "Welcome";
export const SCREEN_WHATS_YOUR_NAME = "WhatsYourName";

export const NAVIGATOR_SWIPE = "SwipeNavigator";
export const NAVIGATOR_FRIENDS = "FriendsNavigator";
export const NAVIGATOR_EVENTS = "EventsNavigator";
export const NAVIGATOR_ME = "MeNavigator";

export default function MainNavigator() {
  return (
    <Tabs.Navigator tabBar={(props) => <BottomTabBar {...props} />}>
      <Tabs.Screen
        options={options}
        name={NAVIGATOR_SWIPE}
        component={SwipeNavigator}
      />
      <Tabs.Screen
        options={options}
        name={NAVIGATOR_FRIENDS}
        component={SwipeNavigator}
      />
      <Tabs.Screen
        options={options}
        name={NAVIGATOR_EVENTS}
        component={SwipeNavigator}
      />

      <Tabs.Screen
        options={options}
        name={NAVIGATOR_ME}
        component={SwipeNavigator}
      />
    </Tabs.Navigator>
  );
}