import { z } from "zod";

import { db } from "./db";

export const swipeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  movieId: z.number(),
  liked: z.boolean(),

  /** Selected directors */
  directors: z.array(z.number()),

  /** Selected cast members */
  cast: z.array(z.number()),

  /** All of the genre ids of the swiped movie */
  movie_genre_ids: z.array(z.number()),

  /** Current list of watch providers the user had when he swiped on this */
  watch_providers: z.array(z.number()),

  /** User's watch region */
  watch_region: z.string(),

  /** Movie language */
  movie_language: z.string(),

  created_at: z.date(),
});

export type Swipe = z.infer<typeof swipeSchema>;

export const swipes = db.collection<Swipe>("swipes");
