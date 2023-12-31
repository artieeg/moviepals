import { z } from "zod";

import { db } from "./db";
import { env } from "./env";

const reviewStateSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    directors: z.array(z.number()),
    collection_id: z.string().optional().default("custom_filters"),
    start_year: z.number().optional(),
    end_year: z.number().optional(),
    remoteApiPage: z.number(),
    remoteApiResponseMovieIdx: z.number(),
    genre_ids: z.array(z.number()),
    watch_providers: z.array(z.number()),
    cast: z.array(z.number()),
    order_by: z.string(),
    min_vote_count: z.number(),
  })
  .strip();

export type ReviewState = z.infer<typeof reviewStateSchema>;

/**
 * The primarily purpose of this collection is to keep track of
 * the remote api page per user per genre and watch provider
 * to avoid as much unnecessary api calls as possible.
 * */
export const reviewState = db.collection<ReviewState>(
  env.MOVIE_SWIPE_REVIEW_STATE_COLLECTION_NAME,
);
