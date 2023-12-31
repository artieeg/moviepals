import { Platform } from "react-native";

import { env } from "./env";

export const WHITE_COLOR = "#FFFFFF";
export const PRIMARY_COLOR = "#EA7436";

export const REVCAT_API_KEY = Platform.select({
  ios: env.REVCAT_KEY_IOS,
  default: env.REVCAT_KEY_ANDROID,
});
