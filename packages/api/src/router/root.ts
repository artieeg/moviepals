import { createTRPCRouter } from "../trpc";
import { ad_impression } from "./ad_impression_fallback";
import { cast } from "./cast";
import { collections } from "./collections";
import { connection } from "./connection";
import { connection_requests } from "./connection_requests";
import { director } from "./director";
import {feedback} from "./feedback";
import { genres } from "./genres";
import { invite } from "./invite";
import { matches } from "./matches";
import { movie_feed } from "./movie_feed";
import { premium } from "./premium";
import { streaming_service } from "./streaming_service";
import { swipe } from "./swipe";
import { user } from "./user";

export const appRouter = createTRPCRouter({
  user,
  cast,
  streaming_service,
  feedback,
  premium,
  genres,
  ad_impression,
  connection,
  connection_requests,
  swipe,
  movie_feed,
  matches,
  invite,
  director,
  collections,
});

// export type definition of API
export type AppRouter = typeof appRouter;
