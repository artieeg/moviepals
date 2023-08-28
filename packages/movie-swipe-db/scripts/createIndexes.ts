import { dbMovieSwipe } from "../index";
import { env } from "../src/env";

export async function createIndexes() {
  await dbMovieSwipe.connect();

  const movies = await getOrCreateCollection(
    env.MOVIE_SWIPE_MOVIE_COLLECTION_NAME,
  );

  const moviesIndex = "movies_index";
  const movieTitleTextIndex = "movie_title_text_index";
  if (!(await movies.indexExists(moviesIndex))) {
    console.log(`Creating index ${moviesIndex}`);
    await movies.createIndex(
      {
        id: 1,
      },
      { name: moviesIndex, unique: true },
    );
  }

  if (!(await movies.indexExists(movieTitleTextIndex))) {
    console.log(`Creating index ${movieTitleTextIndex}`);
    await movies.createIndex(
      {
        original_title: "text",
      },
      { name: movieTitleTextIndex },
    );
  }

  const swipesIndex = "swipes_index";
  const swipes = await getOrCreateCollection(
    env.MOVIE_SWIPE_SWIPE_COLLECTION_NAME,
  );

  if (!(await swipes.indexExists(swipesIndex))) {
    console.log(`Creating index ${swipesIndex}`);
    await swipes.createIndex(
      {
        id: 1,
        userId: 1,
        movieId: 1,
        liked: 1,
      },
      { name: swipesIndex },
    );
  }

  const reviewStatesIndex = "review_states_index";
  const reviewStates = await getOrCreateCollection(
    env.MOVIE_SWIPE_REVIEW_STATE_COLLECTION_NAME,
  );

  if (!(await reviewStates.indexExists(reviewStatesIndex))) {
    console.log(`Creating index ${reviewStatesIndex}`);
    await reviewStates.createIndex(
      {
        id: 1,
        userId: 1,
      },
      { name: reviewStatesIndex },
    );
  }

  process.exit(0);
}

async function getOrCreateCollection(name: string) {
  const collections = await dbMovieSwipe.db.collections();

  const collection = collections.find((c) => c.collectionName === name);

  if (collection) {
    return collection;
  }

  return dbMovieSwipe.db.createCollection(name);
}

createIndexes();
