import { createStackNavigator } from "@react-navigation/stack";

import { PrepareSwipeScreen, SwipeScreen } from "~/screens";
import { StreamingServiceList } from "~/screens/StreamingServiceListScreen";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_SWIPE = "SwipeScreen";
export const SCREEN_PREPARE_SWIPE = "PrepareSwipe";
export const SCREEN_STREAMING_SERVICE_LIST = "StreamingServiceList";

export default function SwipeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_PREPARE_SWIPE}
        component={PrepareSwipeScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_SWIPE}
        component={SwipeScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_STREAMING_SERVICE_LIST}
        component={StreamingServiceList}
      />
    </Stack.Navigator>
  );
}
