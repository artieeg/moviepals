/**
 * @format
 */

import { AppRegistry, LogBox } from "react-native";

LogBox.ignoreAllLogs();

import { name as appName } from "./app.json";
import { App } from "./src/App";

AppRegistry.registerComponent(appName, () => App);
