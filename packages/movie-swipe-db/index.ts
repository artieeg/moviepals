import { connect } from "./src/db";
import { movies } from "./src/movies";
import { swipes } from "./src/swipes";

export { swipeSchema, type Swipe } from "./src/swipes";
export { movieSchema, type Movie } from "./src/movies";

export const dbMovieSwipe = {
  connect,
  movies,
  swipes,
};
