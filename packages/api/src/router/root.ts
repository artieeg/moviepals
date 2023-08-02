import { createTRPCRouter } from "../trpc";
import { streaming_service } from "./streaming_service";
import { user } from "./user";

export const appRouter = createTRPCRouter({
  user,
  streaming_service,
});

// export type definition of API
export type AppRouter = typeof appRouter;
