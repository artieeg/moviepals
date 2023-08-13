import { TestIds } from "react-native-google-mobile-ads";
import {
  API_BASE,
  GOOGLE_CLIENT_ID,
  REWARDED_AD_ANDROID,
  REWARDED_AD_IOS,
  TMDB_IMAGE_BASE,
} from "@env";
import { z } from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  API_BASE: z.string(),
  TMDB_IMAGE_BASE: z.string(),
  REWARDED_AD_IOS: z.string(),
  REWARDED_AD_ANDROID: z.string(),
});

export const env = envSchema.parse({
  GOOGLE_CLIENT_ID,
  API_BASE,
  TMDB_IMAGE_BASE,
  REWARDED_AD_IOS: __DEV__ ? TestIds.REWARDED : REWARDED_AD_IOS,
  REWARDED_AD_ANDROID: __DEV__ ? TestIds.REWARDED : REWARDED_AD_ANDROID,
});
