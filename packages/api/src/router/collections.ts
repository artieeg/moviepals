import {createId} from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  collections as collectionsData,
  MovieCollection,
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
        locked: collectionsData
          .flatMap((c) => c.collections)
          .find((c) => c.id === collection.id)?.free
          ? false
          : user.fullAccessPurchaseId
          ? false
          : unlockedCollections
          ? !unlockedCollections.some((i) => i.categoryId === collection.id)
          : true,
      })),
    }));

    //Users on free plans should have a separate group for available collections
    //These collections will will be duplicated
    if (!user.fullAccessPurchaseId) {
      const collections: (MovieCollection & { locked: false })[] = [];

      /** Populate with unlocked or free collections, avoid having duplicates */
      for (const collection of groups.flatMap((g) => g.collections)) {
        if (
          !collections.some((c) => c.id === collection.id) &&
          (collection.free ||
            unlockedCollections.some((i) => i.categoryId === collection.id))
        ) {
          collections.push({ ...collection, locked: false });
        }
      }

      groups.splice(0, 0, {
        id: "available",
        title: "Available Collections",
        expandByDefault: true,
        description:
          "Unlock more collections by watching ads, inviting friends or upgrading",
        collections,
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
            id: createId(),
            userId: ctx.user,
            categoryId: collectionId,
          })
          .executeTakeFirst();

        await ctx.watchedAdCountCache.decWatchedAdsCount(ctx.user);
      }
    }),
});
