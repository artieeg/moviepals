import { createTRPCRouter, protectedProcedure } from "../trpc";

const genres = createTRPCRouter({
  fetchUserGenres: protectedProcedure.query(async ({ ctx }) => {}),
});
