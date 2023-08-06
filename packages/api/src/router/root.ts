import { createTRPCRouter } from "../trpc";
import { connection } from "./connection";
import { connection_requests } from "./connection_requests";
import { genres } from "./genres";
import { streaming_service } from "./streaming_service";
import { user } from "./user";

export const appRouter = createTRPCRouter({
  user,
  streaming_service,
  genres,
  connection,
  connection_requests,
});

// export type definition of API
export type AppRouter = typeof appRouter;
