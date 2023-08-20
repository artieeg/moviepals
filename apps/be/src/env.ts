import { z } from "zod";

const envSchema = z.object({
  USER_DELIVERY_CACHE_REDIS_URL: z.string(),
  LATEST_FEED_RESPONSE_CACHE_REDIS_URL: z.string(),
  SERVED_MOVIE_IDS_CACHE_REDIS_URL: z.string(),

  PORT: z
    .string()
    .default("3000")
    .transform((port) => Number(port)),
});

export const env = envSchema.parse(process.env);
