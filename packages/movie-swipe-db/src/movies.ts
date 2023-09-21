import { z } from "zod";

import { db } from "./db";

const base = {
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string(),
  adult: z.boolean(),
  backdrop_path: z.string().optional(),
  genre_ids: z.array(z.number()),
  original_language: z.string(),
  original_title: z.string(),
  popularity: z.number(),
  release_date: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
};

export const movieSchema = z.object(base).strip();

/**
 * Used in movie feed responses
 * */
export const movieSchemaWithLikes = z
  .object({ likedByFriends: z.boolean() })
  .extend(base);

export type Movie = z.infer<typeof movieSchema>;

export const movies = db.collection<Movie>("movies");
