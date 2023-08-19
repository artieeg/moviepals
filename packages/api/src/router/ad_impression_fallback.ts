import { createTRPCRouter, protectedProcedure } from "../trpc";

/** having the client call this router
* just in case there are issues with admob ssv 
* */
export const ad_impression = createTRPCRouter({
  adImpression: protectedProcedure.mutation(
    async () => {
      //no-op
    },
  ),
});
