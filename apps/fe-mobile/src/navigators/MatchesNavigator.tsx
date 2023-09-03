import { createStackNavigator } from "@react-navigation/stack";

import {
  MatchListScreenV2,
  SCREEN_MATCH_LIST_V2,
} from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export default function MatchesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={options}
        name={SCREEN_MATCH_LIST_V2}
        component={MatchListScreenV2}
      />
    </Stack.Navigator>
  );
}
