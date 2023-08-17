import { genres as genreDefinitions } from "../genres";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const genres = createTRPCRouter({
  fetchAllGenres: protectedProcedure.query(async () => {
    return genreDefinitions;
  }),
});
