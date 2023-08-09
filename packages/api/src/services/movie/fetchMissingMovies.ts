import { Movie } from "@moviepals/dbmovieswipe";

import { getMovies } from "../tmdb";

/**
 * Fetches movies from TMDB, excluding movies that have already been swiped
 * */
export async function fetchMissingMovies({
  count,
  excludeMovieIds,
  nextTmdbPage,
  nextTmdbStartFromMovieIdx,
  mixInMovieCount,
  moviesPerTmdbPage,
  fetch,
  fetchParams,
}: {
  /** How many movies to include in the response */
  count: number;

  excludeMovieIds: number[];
  moviesPerTmdbPage: number;
  nextTmdbPage: number;
  nextTmdbStartFromMovieIdx: number;
  mixInMovieCount: number;
  fetch: typeof getMovies;
  fetchParams: {
    region: string;
    watchProviderIds: number[];
    genres: number[];
  };
}) {
  const moviesLeftToFetch = count - mixInMovieCount;
  const tmdbPagesToFetch = Math.ceil(moviesLeftToFetch / moviesPerTmdbPage);

  let pageOffset = 0;
  let batch = tmdbPagesToFetch;

  const movies: Movie[] = [];

  let attempts = tmdbPagesToFetch * 2;

  while (attempts--) {
    const promises: Promise<Movie[]>[] = [];

    for (; pageOffset < batch; pageOffset++) {
      promises.push(
        fetch({
          ...fetchParams,
          page: nextTmdbPage + pageOffset,
        }),
      );
    }

    const results = await Promise.all(promises);

    const fetchedMovies = results
      .flat()
      .filter((movie) => !excludeMovieIds.includes(movie.id))
      .slice(
        nextTmdbStartFromMovieIdx,
        nextTmdbStartFromMovieIdx + moviesLeftToFetch,
      );

    movies.push(...fetchedMovies);

    if (movies.length >= moviesLeftToFetch) {
      const nextMovieToStartFrom =
        nextTmdbStartFromMovieIdx === 0
          ? 0
          : nextTmdbPage - nextTmdbStartFromMovieIdx;

      const nextPageToStartFrom = nextTmdbPage + pageOffset;

      return { movies, nextPageToStartFrom, nextMovieToStartFrom };
    } else {
      batch = Math.ceil(batch / 2);
    }
  }
}
