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

const streamingServiceSchema = z.object({
  display_priorities: z.record(z.string(), z.number()),
  display_priority: z.number(),
  logo_path: z.string(),
  provider_name: z.string(),
  provider_id: z.number(),
});

export type StreamingService = z.infer<typeof streamingServiceSchema>;

const streamingServicesResponseSchema = z.object({
  results: z.array(streamingServiceSchema),
});

export type GetMoviesParams = {
  "primary_release_date.gte": string | undefined;
  "primary_release_date.lte": string | undefined;
  "sort_by": string;
  "vote_count.gte": number;
  with_watch_providers: string;
  watch_region: string | undefined;
  with_genres: string;
  with_cast: string;
  with_people: string;
  page: number;
};

export async function getMovies(params: Record<string, unknown>) {
  try {
    const r = await tmdb.get("discover/movie", {
      params: {
        ...params,
        include_adult: false,
      },
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
  } catch (e) {
    throw e;
  }
}

const personSchema = z.object({
  adult: z.boolean(),
  gender: z.number(),
  id: z.number(),
  known_for: z.array(z.unknown()),
  known_for_department: z.string().optional(),
  name: z.string(),
  popularity: z.number(),
  profile_path: z.string().nullable(),
});

export type Person = z.infer<typeof personSchema>;

const castFetchResultSchema = z.object({
  page: z.number(),
  results: z.array(personSchema),
});

export async function getPopularCast(page: number) {
  const r = await tmdb.get("person/popular", { params: { page } });

  const { results } = castFetchResultSchema.parse(r.data);

  return results.filter((r) => r.known_for_department === "Acting");
}

export async function searchCast(query: string) {
  const r = await tmdb.get("search/person", { params: { query } });

  const { results } = castFetchResultSchema.parse(r.data);

  return results.filter((r) => r.known_for_department === "Acting");
}

export async function searchDirectors(query: string) {
  const r = await tmdb.get("search/person", { params: { query } });

  const { results } = castFetchResultSchema.parse(r.data);

  return results.filter((r) => r.known_for_department === "Directing");
}
