import { connect } from "./src/db";
import { movies } from "./src/movies";
import { reviewState } from "./src/review_state";
import { swipes } from "./src/swipes";

export { swipeSchema, type Swipe } from "./src/swipes";
export { movieSchema, type Movie } from "./src/movies";
export { reviewState, type ReviewState } from "./src/review_state";

export const dbMovieSwipe = {
  connect,
  movies,
  swipes,
  reviewState,
};

export type DbMovieSwipe = typeof dbMovieSwipe;
