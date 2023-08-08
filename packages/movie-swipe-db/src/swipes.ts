import { z } from "zod";

import { db } from "./db";

export const swipeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  movieId: z.number(),
  liked: z.boolean(),
  genre_ids: z.array(z.number()),
  watch_providers: z.array(z.number()),
  watch_region: z.string(),
  language: z.string(),
});

type SwipeDocument = z.infer<typeof swipeSchema>;

export const swipes = db.collection<SwipeDocument>("swipes");
