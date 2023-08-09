import { z } from "zod";

import { db } from "./db";

export const swipeSchema = z.object({
  userId: z.string(),
  movieId: z.number(),
  liked: z.boolean(),

  /** All of the genre ids of the swiped movie */
  movie_genre_ids: z.array(z.number()),

  /** Current list of watch providers the user has */
  watch_providers: z.array(z.number()),

  /** User's watch region */
  watch_region: z.string(),

  /** Movie language */
  movie_language: z.string(),
});

export type Swipe = z.infer<typeof swipeSchema>;

export const swipes = db.collection<Swipe>("swipes");
