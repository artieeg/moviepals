import { createTRPCRouter } from "../trpc";
import { cast } from "./cast";
import { connection } from "./connection";
import { connection_requests } from "./connection_requests";
import {director} from "./director";
import { genres } from "./genres";
import { invite } from "./invite";
import { matches } from "./matches";
import { movie_feed } from "./movie_feed";
import {premium} from "./premium";
import { streaming_service } from "./streaming_service";
import { swipe } from "./swipe";
import { user } from "./user";

export const appRouter = createTRPCRouter({
  user,
  cast,
  streaming_service,
  premium,
  genres,
  connection,
  connection_requests,
  swipe,
  movie_feed,
  matches,
  invite,
  director,
});

// export type definition of API
export type AppRouter = typeof appRouter;
