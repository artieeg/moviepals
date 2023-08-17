import { createTRPCRouter } from "../trpc";
import { cast } from "./cast";
import { connection } from "./connection";
import { connection_requests } from "./connection_requests";
import { genres } from "./genres";
import { invite } from "./invite";
import { matches } from "./matches";
import { movie_feed } from "./movie_feed";
import { streaming_service } from "./streaming_service";
import { swipe } from "./swipe";
import { user } from "./user";

export const appRouter = createTRPCRouter({
  user,
  cast,
  streaming_service,
  genres,
  connection,
  connection_requests,
  swipe,
  movie_feed,
  matches,
  invite,
});

// export type definition of API
export type AppRouter = typeof appRouter;
