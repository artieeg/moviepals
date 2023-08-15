import { createStackNavigator } from "@react-navigation/stack";

import {
  MeScreen,
  SCREEN_ME,
} from "~/screens";
import { options } from "./options";

const Stack = createStackNavigator();

export default function MeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen options={options} name={SCREEN_ME} component={MeScreen} />
    </Stack.Navigator>
  );
}
