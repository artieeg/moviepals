import { encode } from "querystring";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";

import {
  dbMovieSwipe,
  MongoBulkWriteError,
  Movie,
  ReviewState,
  Swipe,
} from "@moviepals/dbmovieswipe";
import { SwipeFilterParams } from "@moviepals/dbmovieswipe/src/swipes";
import { movieFeedFilter, MovieFeedFilter } from "@moviepals/filters";

import { logger } from "../logger";
import { getMovies, GetMoviesParams } from "../services";
import {
  Context,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

/** Number of movies that we return to the client */
const MOVIES_PER_PAGE = 40;

/** Max number of movies that we mix in from friend swipes */
const MIX_IN_MOVIES_COUNT = 20;

export const movie_feed = createTRPCRouter({
  getMovieFeedConfig: publicProcedure.query(() => {
    return {
      text: "MoviePals depends on occassional ads. They are like the popcorn to our movie marathon  – helps us keep the reels spinning.\n\nPlease watch a short ad and get infinite swipes for the day! You can also buy premium for unlimited access (... and share it with up to 4 people 🙌)",
    };
  }),

  getMovieFeed: protectedProcedure
    .input(movieFeedFilter)
    .query(async ({ ctx, input }) => {
      const userAndConnectionsPromise = ctx.appDb
        .transaction()
        .execute(async (trx) => {
          const user = await trx
            .selectFrom("User")
            .where("id", "=", ctx.user)
            .select(["fullAccessPurchaseId"])
            .executeTakeFirstOrThrow(
              () => new TRPCError({ code: "NOT_FOUND" }),
            );

          const unlockedCollection = await trx
            .selectFrom("UnlockedCategory")
            .where((eb) =>
              eb.and([
                eb("categoryId", "=", input.collection_id),
                eb("userId", "=", ctx.user),
              ]),
            )
            .select("categoryId")
            .executeTakeFirst();

          const connections = await trx
            .selectFrom("Friend")
            .where((eb) =>
              eb.or([
                eb("firstUserId", "=", ctx.user),
                eb("secondUserId", "=", ctx.user),
              ]),
            )
            .selectAll()
            .execute();

          return { user, unlockedCollection, connections };
        });

      const [
        { user, connections, unlockedCollection },
        watchedAdsCount,
        swipeCount,
        userReviewState,
        previouslySwipedMovieIds,
      ] = await Promise.all([
        userAndConnectionsPromise,
        ctx.watchedAdCountCache.getWatchedAdsCount(ctx.user),
        ctx.swipeCountCache.getSwipeCount(ctx.user),
        getOrCreateReviewState(ctx.user, input, ctx),
        getPreviouslySwipedMovieIds(ctx.user),
      ]);

      /*
      if (
        input.cast.length > 0 ||
        input.directors.length > 0 ||
        input.genres.length > 0
      ) {
        if (
          !unlockedCollection ||
          input.collection_id !== "best-of-all-time" ||
          input.custom_filters
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This is not available currently",
          });
        }

        if (input.custom_filters && !user.fullAccessPurchaseId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This is not available currently",
          });
        }
      }
       * */

      const friendUserIds = connections.map((c) =>
        c.firstUserId === ctx.user ? c.secondUserId : c.firstUserId,
      );

      logger.info(
        {
          user,
          friendUserIds,
          watchedAdsCount,
          swipeCount,
          userReviewState,
          previouslySwipedMovieIds,
        },
        "movie feed data fetch",
      );

      const recentlyServedMovies = await getRecentlyServedMovies(
        userReviewState.id,
        ctx,
      );

      logger.info({
        swipeCount,
        watchedAdsCount,
      });

      const responseTotalMovieCount = MOVIES_PER_PAGE;

      const {
        movies: feed,
        nextRemoteApiPage,
        noMoreMovies,
      } = await getMoviePage({
        ctx,
        userReviewState,
        input,
        friendUserIds,
        fetchRandomSwipes,
        fetchMoviesDataFromLocalDb,
        fetchMoviesFromRemoteApi,
        responseTotalMovieCount,
        previouslySwipedMovieIds,
        recentlyServedMovies,
        responseMovieFromFriendCount: MIX_IN_MOVIES_COUNT,
      });

      let response: {
        feed: Movie[];
        unableToFindMovies?: boolean;
        noMoreMovies?: boolean;
        cursor: number;
      } = {
        feed,
        cursor: input.cursor + 1,
      };

      if (
        feed.length < MOVIES_PER_PAGE &&
        feed.length !== responseTotalMovieCount
      ) {
        logger.warn(
          {
            MOVIES_PER_PAGE,
            totalMovieFeedCount: responseTotalMovieCount,
            feed,
          },
          "Served less movies than expected",
        );
      }

      if (noMoreMovies) {
        if (userReviewState.remoteApiPage === 1 && feed.length === 0) {
          response.unableToFindMovies = true;
        } else {
          response.noMoreMovies = true;
        }
      }

      //Count the response if it's fully successful
      if (!response.noMoreMovies && !response.unableToFindMovies) {
        await Promise.all([
          setRemoteApiPage(userReviewState.id, nextRemoteApiPage, ctx),
          ctx.latestFeedResponseCache.setLatestFeedResponse(
            userReviewState.id,
            feed,
          ),
        ]);
      }

      return response;
    }),
});

async function setRemoteApiPage(
  reviewStateId: string,
  page: number,
  ctx: Context,
) {
  await ctx.dbMovieSwipe.reviewState.updateOne(
    { id: reviewStateId },
    { $set: { remoteApiPage: page } },
  );
}

async function getRecentlyServedMovies(reviewStateId: string, ctx: Context) {
  const r = await ctx.latestFeedResponseCache.getLatestFeedResponse(
    reviewStateId,
  );

  return r ?? [];
}

async function fetchMoviesFromRemoteApi(
  params: GetMoviesParams,
  ctx: Context,
  prefetchNextPages = false,
) {
  const qs = encode(params);
  const cached = await ctx.remoteApiResponseCache.getCachedResponse(qs);

  if (cached) {
    logger.info(
      {
        params,
        qs,
        cached: cached.length,
      },
      "Returning cached api response",
    );

    return cached;
  }

  const movies = await getMovies(params);

  await ctx.remoteApiResponseCache.setResponse(qs, movies);

  //Prefetch future pages
  for (let i = params.page + 1, a = 0; a < 5 && prefetchNextPages; a++, i++) {
    setTimeout(() => {
      const newParams = { ...params, page: i };
      logger.info({ params: newParams }, "prefetching next page");

      fetchMoviesFromRemoteApi(newParams, ctx, true);
    }, a * 1000);
  }

  try {
    if (movies.length > 0) {
      //The index should exist
      const result = await ctx.dbMovieSwipe.movies.insertMany(movies, {
        ordered: false,
      });

      logger.info(
        {
          message: "Inserted movies",
          count: result.insertedCount,
        },
        "Inserted new movies",
      );
    }
  } catch (e) {
    if (e instanceof MongoBulkWriteError) {
      logger.info(
        {
          message: "Inserted movies",
          count: (e as MongoBulkWriteError).result.insertedCount,
        },
        "Inserted new movies",
      );
    } else {
      logger.error(e, typeof e);

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }

  return movies;
}

async function getPreviouslySwipedMovieIds(userId: string) {
  const swipes = await dbMovieSwipe.swipes.find({ userId }).toArray();

  return swipes.map((s) => s.movieId);
}

async function fetchMoviesDataFromLocalDb(movieIds: number[]) {
  const movies = await dbMovieSwipe.movies
    .find({ id: { $in: movieIds } })
    .toArray();

  return movies;
}

async function fetchRandomSwipes(
  userIds: string[],
  excludeMovieIds: number[],
  count: number,
  filters: SwipeFilterParams,
  ctx: Context,
) {
  const swipes = await ctx.dbMovieSwipe.swipes
    .find({
      userId: { $in: userIds },
      movieId: { $nin: excludeMovieIds },
      ...filters,
    })
    .toArray();

  return randomElements(swipes, count);
}

async function getOrCreateReviewState(
  user: string,
  input: MovieFeedFilter,
  ctx: Context,
) {
  const {
    collection_id,
    watchProviderIds,
    genres,
    directors,
    cast,
    start_year,
    end_year,
    order_by,
    min_vote_count,
  } = input;

  const reviewState = await ctx.dbMovieSwipe.reviewState.findOne({
    collection_id,
    userId: user,
    start_year,
    end_year,
    watch_providers:
      watchProviderIds.length > 0
        ? { $all: watchProviderIds }
        : { $exists: true },
    cast: cast.length > 0 ? { $all: cast } : { $exists: true },
    directors: directors.length > 0 ? { $all: directors } : { $exists: true },
    genre_ids: genres.length > 0 ? { $all: genres } : { $exists: true },
  });

  if (reviewState) {
    return reviewState;
  } else {
    const newReviewState: ReviewState = {
      id: createId(),
      userId: user,
      watch_providers: watchProviderIds,
      cast,
      start_year,
      collection_id,
      order_by,
      min_vote_count,
      end_year,
      directors,
      genre_ids: genres,
      remoteApiPage: 1,
      remoteApiResponseMovieIdx: 0,
    };

    await dbMovieSwipe.reviewState.insertOne(newReviewState);

    return newReviewState;
  }
}

async function getMoviePage({
  friendUserIds,
  userReviewState,
  input: {
    genres,
    quick_match_mode,
    directors,
    cursor,
    region,
    cast,
    watchProviderIds,
    start_year,
    end_year,
    order_by,
    min_vote_count,
  },
  ctx,
  fetchRandomSwipes,
  fetchMoviesDataFromLocalDb,
  fetchMoviesFromRemoteApi,
  responseTotalMovieCount,
  previouslySwipedMovieIds,
  recentlyServedMovies,
  responseMovieFromFriendCount,
}: {
  ctx: Context;
  input: MovieFeedFilter;

  userReviewState: ReviewState;
  friendUserIds: string[];
  previouslySwipedMovieIds: number[];

  recentlyServedMovies: Movie[];

  responseTotalMovieCount: number;
  responseMovieFromFriendCount: number;

  fetchRandomSwipes: (
    userIds: string[],
    excludeMovieIds: number[],
    count: number,
    filters: SwipeFilterParams,
    ctx: Context,
  ) => Promise<Swipe[]>;

  fetchMoviesDataFromLocalDb: (
    movieIds: number[],
    ctx: Context,
  ) => Promise<Movie[]>;

  fetchMoviesFromRemoteApi: (
    params: GetMoviesParams,
    ctx: Context,
  ) => Promise<Movie[]>;
}) {
  let shouldShuffleResponse = true;
  const moviesToServe: Movie[] = [];

  const recentlyServedMovieIds = recentlyServedMovies.map((m) => m.id);

  /**
   * If user has requested the first page, we should
   * serve the latest response again if possible
   * */
  if (cursor === 0) {
    /**
     * Exclude movies that the user has swiped on.
     * This allows us to let the user start exactly where they left off
     */
    const filtered = recentlyServedMovies.filter(
      (m) => !previouslySwipedMovieIds.includes(m.id),
    );

    if (filtered.length > 0) {
      logger.info("Serve a portion of the previous response", filtered.length);

      shouldShuffleResponse = false;

      for (const movie of filtered) {
        moviesToServe.push(movie);
      }
    }
  }

  /**
   * Filter out movies that the user has already swiped on.
   *
   * Since the feed page can be prefetched, we also need to exclude
   * movies that we have just served.
   * */
  const excludedMovieIds = [
    moviesToServe.map((m) => m.id),
    recentlyServedMovieIds,
    previouslySwipedMovieIds,
  ].flat();

  logger.info(
    {
      excludedMovieIdsLength: excludedMovieIds.length,
    },
    "excluded movie ids",
  );

  const randomFriendSwipes = await fetchRandomSwipes(
    friendUserIds,
    excludedMovieIds,
    responseMovieFromFriendCount,
    quick_match_mode
      ? { liked: true }
      : {
          liked: true,

          movie_genre_ids:
            genres.length > 0 ? { $in: genres } : { $exists: true },

          cast: cast.length > 0 ? { $in: cast } : { $exists: true },

          watch_providers:
            watchProviderIds.length > 0
              ? { $in: watchProviderIds }
              : { $exists: true },

          directors:
            directors.length > 0 ? { $in: directors } : { $exists: true },
        },
    ctx,
  );

  const randomFriendSwipesMovieIds = randomFriendSwipes.map((s) => s.movieId);

  logger.info(
    {
      randomFriendSwipesLength: randomFriendSwipesMovieIds.length,
    },
    "random friend swipe length",
  );

  const friendMoviesToMixInPromise = fetchMoviesDataFromLocalDb(
    randomFriendSwipesMovieIds,
    ctx,
  );

  const latestRemoteApiPage = userReviewState.remoteApiPage;

  /**
   * Represents how many movies we have left to fulfill the request.
   * This is the number of movies that we need to fetch from the remote API.
   * */
  const leftToFetch =
    responseTotalMovieCount - randomFriendSwipes.length - moviesToServe.length;

  const params: Omit<GetMoviesParams, "page"> = {
    "primary_release_date.gte": start_year ? `${start_year}-01-01` : undefined,
    "primary_release_date.lte": end_year ? `${end_year}-12-31` : undefined,
    sort_by: order_by,
    "vote_count.gte": min_vote_count,
    with_watch_providers: watchProviderIds.join("|"),
    watch_region: region,
    with_genres: genres.join(","),
    with_cast: cast.join(","),
    with_people: directors.join(","),
  };

  const moviesFetchedFromRemoteApi: Movie[] = [];
  let page = latestRemoteApiPage;

  logger.info(
    {
      leftToFetch,
      responseTotalMovieCount,
      randomFriendSwipes: randomFriendSwipes.length,
      moviesToServe: moviesToServe.length,
    },
    "Left to fetch",
  );

  /*
  logger.info({
    removeApiParams: params,
  }, "Remote API params");
  */

  let noMoreMovies = false;

  for (; moviesFetchedFromRemoteApi.length < leftToFetch; page++) {
    logger.info(
      {
        ...params,
        page,
      },
      "Fetching movies from remote api",
    );

    const fetchedMovies = await fetchMoviesFromRemoteApi(
      {
        ...params,
        page,
      },
      ctx,
    );

    if (fetchedMovies.length === 0) {
      noMoreMovies = true;
      break;
    }

    /**
     * Exclude previously served and/or swiped movies
     * as well as movies that user has received from the API
     */
    const filteredMovies = fetchedMovies.filter(
      (m) =>
        !excludedMovieIds.includes(m.id) &&
        !randomFriendSwipesMovieIds.includes(m.id),
    );

    for (const movie of filteredMovies) {
      moviesFetchedFromRemoteApi.push(movie);

      if (moviesFetchedFromRemoteApi.length >= leftToFetch) {
        break;
      }
    }
  }

  logger.info(
    `Had to make ${page - latestRemoteApiPage} requests to remote api`,
  );

  for (const movie of moviesFetchedFromRemoteApi) {
    moviesToServe.push(movie);
  }

  //Finish loading friend movies and append them to response
  const friendMoviesToMixIn = await friendMoviesToMixInPromise;

  logger.info(
    { friendMoviesCount: friendMoviesToMixIn.length },
    "mixing in friend movies",
  );

  for (const movie of friendMoviesToMixIn) {
    moviesToServe.push(movie);
  }

  //Shuffle result
  const shuffledMovies = shouldShuffleResponse
    ? arrayShuffle(moviesToServe)
    : moviesToServe;

  /**
   * It's better to make a redundant call just in case
   * the latest feed response cache is empty
   * */
  const nextRemoteApiPage = Math.max(1, page - 1);

  return {
    movies: shuffledMovies.slice(0, responseTotalMovieCount),
    nextRemoteApiPage,
    noMoreMovies,
  };
}

function randomElements<T>(array: T[], count: number) {
  if (array.length === 0) {
    return array;
  }

  const elements: T[] = [];

  let attemps = count * 3;

  for (
    let i = 0;
    elements.length < Math.min(array.length, count) && attemps >= 0;
    i++, attemps--
  ) {
    logger.info(
      { count, ellen: elements.length, len: array.length, i },
      "Random elements",
    );
    const randomIndex = Math.floor(Math.random() * array.length);

    if (elements.includes(array[randomIndex]!)) {
      continue;
    }

    elements.push(array[randomIndex]!);
  }

  if (attemps <= 0) {
    logger.error(
      { count, found: elements.length, input_len: array.length, array },
      "Failed to pick random elements",
    );
  }

  return elements;
}

function arrayShuffle<T>(array: T[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex]!,
      array[currentIndex]!,
    ];
  }

  return array;
}
