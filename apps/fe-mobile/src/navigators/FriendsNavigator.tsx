import { createStackNavigator } from "@react-navigation/stack";

import { FriendRequestListScreen, FriendsListScreen } from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_FRIENDS_LIST = "FriendsList";
export const SCREEN_FRIEND_REQUEST_LIST = "FriendRequestList";

export default function FriendsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_FRIENDS_LIST}
        component={FriendsListScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_FRIEND_REQUEST_LIST}
        component={FriendRequestListScreen}
      />
    </Stack.Navigator>
  );
}
