/**
 * @format
 */

import { AppRegistry, LogBox } from "react-native";
import { codePush } from "react-native-code-push";
import messaging from "@react-native-firebase/messaging";

import { name as appName } from "./app.json";
import { App } from "./src/App";
import { handleRemoteMessage } from "./src/utils/handleRemoteMessage";

LogBox.ignoreAllLogs();

messaging().setBackgroundMessageHandler(handleRemoteMessage);

AppRegistry.registerComponent(
  appName,
  codePush(() => App),
);
