import { createStackNavigator } from "@react-navigation/stack";

import { FriendsListScreen } from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_FRIENDS_LIST = "FriendsList";

export default function FriendsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_FRIENDS_LIST}
        component={FriendsListScreen}
      />
    </Stack.Navigator>
  );
}
