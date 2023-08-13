import axios from "axios";
import { z } from "zod";

import { Movie, movieSchema } from "@moviepals/dbmovieswipe";

import { env } from "../utils/env";
import { cachify } from "./cache";

export const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    Authorization: `Bearer ${env.TMDB_API_KEY}`,
  },
});

tmdb.get = cachify(tmdb.get);

/**
 * Returns a list of stremaing services for the given country,
 * sorted by priority.
 * */
export async function getStreamingServices(country: string) {
  const response = await tmdb.get("watch/providers/movie", {
    params: {
      watch_region: country,
    },
  });

  return streamingServicesResponseSchema.parse(response.data).results;
}

const streamingServicesResponseSchema = z.object({
  results: z.array(
    z.object({
      display_priorities: z.record(z.string(), z.number()),
      display_priority: z.number(),
      logo_path: z.string(),
      provider_name: z.string(),
      provider_id: z.number(),
    }),
  ),
});

const getMoviesSchema = z.object({
  results: z.array(movieSchema),
});

export async function getMovies(params: unknown) {
  const r = await tmdb.get("discover/movie", {
    params,
  });

  const movies = r.data.results
    .map((movie: unknown) => {
      const r = movieSchema.safeParse(movie);

      return r.success ? r.data : null;
    })
    .filter(Boolean) as Movie[];

  /** Replace the poster urls with full path  */
  movies.forEach((movie) => {
    movie.poster_path = `https://image.tmdb.org/t/p/original${movie.poster_path}`;
  });

  return movies;
}
