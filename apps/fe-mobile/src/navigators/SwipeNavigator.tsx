import { createStackNavigator } from "@react-navigation/stack";

import {
  GenreFilterScreen,
  PrepareSwipeScreen,
  StreamingServiceList,
  SwipeScreen,
  ThankYouScreen,
} from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_SWIPE = "SwipeScreen";
export const SCREEN_PREPARE_SWIPE = "PrepareSwipe";
export const SCREEN_STREAMING_SERVICE_LIST = "StreamingServiceList";
export const SCREEN_GENRE_FILTER = "GenreFilter";
export const SCREEN_THANK_YOU = "ThankYouScreen";

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
        name={SCREEN_GENRE_FILTER}
        component={GenreFilterScreen}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_STREAMING_SERVICE_LIST}
        component={StreamingServiceList}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_THANK_YOU}
        component={ThankYouScreen}
      />
    </Stack.Navigator>
  );
}
