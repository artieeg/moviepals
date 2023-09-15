import { createStackNavigator } from "@react-navigation/stack";

import {
  CastListScreen,
  DirectorListScreen,
  GenreFilterScreen,
  MovieCollectionList,
  PrepareSwipeScreen,
  SCREEN_CAST_LIST,
  SCREEN_DIRECTOR_LIST,
  SCREEN_MOVIE_COLLECTION_LIST_SCREEN,
  SCREEN_THANK_YOU,
  StreamingServiceList,
  ThankYouScreen,
} from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export const SCREEN_SWIPE = "SwipeScreen";
export const SCREEN_PREPARE_SWIPE = "PrepareSwipe";

export default function SwipeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_MOVIE_COLLECTION_LIST_SCREEN}
        component={MovieCollectionList}
      />

      <Stack.Screen
        options={options}
        name={SCREEN_PREPARE_SWIPE}
        component={PrepareSwipeScreen}
      />
    </Stack.Navigator>
  );
}
