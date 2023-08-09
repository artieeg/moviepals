import { z } from "zod";

import { db } from "./db";
import { env } from "./env";

const reviewStateSchema = z
  .object({
    userId: z.string(),
    remoteApiPage: z.number(),
    remoteApiResponseMovieIdx: z.number(),
    genre_ids: z.array(z.number()),
    watch_providers: z.array(z.number()),
  })
  .strip();

export type ReviewState = z.infer<typeof reviewStateSchema>;

export const reviewState = db.collection<ReviewState>(
  env.MOVIE_SWIPE_REVIEW_STATE_COLLECTION_NAME,
);
