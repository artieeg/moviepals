import { createTRPCRouter } from "../trpc";
import { genres } from "./genres";
import { streaming_service } from "./streaming_service";
import { user } from "./user";

export const appRouter = createTRPCRouter({
  user,
  streaming_service,
  genres,
});

// export type definition of API
export type AppRouter = typeof appRouter;
