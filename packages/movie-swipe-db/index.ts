import { connect } from "./src/db";
import { movies } from "./src/movies";
import { swipes } from "./src/swipes";

export { swipeSchema } from "./src/swipes";
export { movieSchema } from "./src/movies";

export const dbMovieSwipe = {
  connect,
  movies,
  swipes,
};
