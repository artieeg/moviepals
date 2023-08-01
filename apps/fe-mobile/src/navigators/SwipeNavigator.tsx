import { createStackNavigator } from "@react-navigation/stack";

import { PrepareSwipeScreen } from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_PREPARE_SWIPE = "PrepareSwipe";

export default function SwipeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_PREPARE_SWIPE}
        component={PrepareSwipeScreen}
      />
    </Stack.Navigator>
  );
}
