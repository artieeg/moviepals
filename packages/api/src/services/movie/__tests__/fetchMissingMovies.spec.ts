import { describe, expect, it, vi } from "vitest";

import { fetchMissingMovies } from "../fetchMissingMovies";

describe("fetchMissingMovies", () => {
  it("should fetch movies", async () => {
    const fetch = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await fetchMissingMovies({
      count: 2,
      excludeMovieIds: [],
      moviesPerTmdbPage: 2,
      nextTmdbPage: 0,
      nextTmdbStartFromMovieIdx: 0,
      mixInMovieCount: 0,
      fetch,
      fetchParams: {
        region: "US",
        watchProviderIds: [],
        genres: [],
      },
    });

    expect(result).toEqual({
      movies: [{ id: 1 }, { id: 2 }],
      nextPageToStartFrom: 1,
      nextMovieToStartFrom: 0,
    });
  });

  it("excludes movies from the list", async () => {
    const fetch = vi.fn();

    fetch.mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const result = await fetchMissingMovies({
      count: 2,
      excludeMovieIds: [1],
      moviesPerTmdbPage: 2,
      nextTmdbPage: 0,
      nextTmdbStartFromMovieIdx: 0,
      mixInMovieCount: 0,
      fetch,
      fetchParams: {
        region: "US",
        watchProviderIds: [],
        genres: [],
      },
    });

    expect(result).toEqual({
      movies: [{ id: 2 }, { id: 3 }],
      nextPageToStartFrom: 1,
      nextMovieToStartFrom: 0,
    });
  });

  it("fetches multiple pages from the remote api if needed", async () => {
    const fetch = vi.fn();

    fetch.mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }]);
    fetch.mockResolvedValueOnce([{ id: 4 }, { id: 5 }, { id: 6 }]);

    const result = await fetchMissingMovies({
      count: 4,
      excludeMovieIds: [1, 2],
      moviesPerTmdbPage: 3,
      nextTmdbPage: 0,
      nextTmdbStartFromMovieIdx: 0,
      mixInMovieCount: 0,
      fetch,
      fetchParams: {
        region: "US",
        watchProviderIds: [],
        genres: [],
      },
    });

    expect(fetch).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      movies: [
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
      ],
      nextPageToStartFrom: 2,
      nextMovieToStartFrom: 0,
    });
  });
});
