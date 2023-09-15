import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  collections as collectionsData,
  MovieCollectionGroup,
} from "../collections";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const collections = createTRPCRouter({
  getCollectionList: protectedProcedure.query(async ({ ctx }) => {
    const { unlockedCollections, user } = await ctx.appDb
      .transaction()
      .execute(async (trx) => {
        const unlockedCollections = await trx
          .selectFrom("UnlockedCategory")
          .where("userId", "=", ctx.user)
          .select("categoryId")
          .execute();

        const user = await trx
          .selectFrom("User")
          .where("id", "=", ctx.user)
          .select("fullAccessPurchaseId")
          .executeTakeFirstOrThrow(
            () =>
              new TRPCError({ code: "NOT_FOUND", message: "User not found" }),
          );

        return { unlockedCollections, user };
      });

    const groups = collectionsData.map((group) => ({
      ...group,
      collections: group.collections.map((collection) => ({
        ...collection,
        locked: user.fullAccessPurchaseId
          ? false
          : unlockedCollections
          ? !unlockedCollections.some((i) => i.categoryId === collection.id)
          : true,
      })),
    }));

    //Users on free plans should have a separate group for available collections
    //These collections will will be duplicated
    if (!user.fullAccessPurchaseId) {
      groups.splice(0, 0, {
        id: "available",
        title: "Available Collections",
        description:
          "Unlock more collections by watching ads, inviting friends or upgrading",
        collections: collectionsData
          .flatMap((c) => c.collections)
          .filter(
            (c) =>
              c.free || unlockedCollections.some((i) => i.categoryId === c.id),
          )
          .map((c) => ({
            ...c,
            locked: false,
          })),
      });
    }

    return { groups };
  }),

  unlockCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { collectionId } }) => {
      const collection = collectionsData
        .flatMap((c) => c.collections)
        .find((i) => i.id === collectionId);

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      const watchedAdsCount = await ctx.watchedAdCountCache.getWatchedAdsCount(
        ctx.user,
      );

      if (watchedAdsCount > 0) {
        await ctx.appDb
          .insertInto("UnlockedCategory")
          .values({
            userId: ctx.user,
            categoryId: collectionId,
          })
          .executeTakeFirst();

        await ctx.watchedAdCountCache.decWatchedAdsCount(ctx.user);
      }
    }),
});
