import { z } from "zod";

export const envSchema = z.object({
  MOVIE_SWIPE_DATABASE_URL: z.string(),
  MOVIE_SWIPE_MOVIE_COLLECTION_NAME: z.string(),
  MOVIE_SWIPE_SWIPE_COLLECTION_NAME: z.string(),
  MOVIE_SWIPE_DB_NAME: z.string(),
});

export const env = envSchema.parse(process.env);
