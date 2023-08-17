import Redis from "ioredis";
import { DateTime } from "luxon";
import { z } from "zod";

import { logger } from "../logger";

const userFeedDeliveryStateSchema = z.object({
  page: z.string().transform((v) => parseInt(v)),
  ads_watched: z.string().transform((v) => parseInt(v)),
});

export type UserFeedDeliveryState = z.infer<typeof userFeedDeliveryStateSchema>;

/**
 * Keeps track of:
 * 1. how many pages we've already served to the user during the day
 * 2. how many pages the user is allowed based on how many ads they've watched
 */
export class UserFeedDeliveryCache {
  constructor(private client: Redis) {}

  async incPage(userId: string) {
    const state = await this.getDeliveryState(userId);

    if (!state) {
      await this.setDeliveryState(userId, {
        page: 1,
        ads_watched: 0,
      });
    } else {
      await this.setDeliveryState(userId, {
        ...state,
        page: state.page + 1,
      });
    }
  }

  async incAdWatched(userId: string) {
    const state = await this.getDeliveryState(userId);

    if (!state) {
      await this.setDeliveryState(userId, {
        page: 0,
        ads_watched: 1,
      });
    } else {
      await this.setDeliveryState(userId, {
        ...state,
        ads_watched: state.ads_watched + 1,
      });
    }
  }

  private getExpireAt() {
    const tomorrow = DateTime.utc().startOf("day").plus({ days: 1 }).toJSDate();

    return Math.floor(tomorrow.getTime() / 1000);
  }

  async setDeliveryState(userId: string, state: UserFeedDeliveryState) {
    const pipeline = this.client.pipeline();

    pipeline.hmset(userId, state);
    pipeline.expireat(userId, this.getExpireAt());

    await pipeline.exec();
  }

  async getDeliveryState(userId: string) {
    const state = await this.client.hgetall(userId);

    const result = userFeedDeliveryStateSchema.safeParse(state);

    logger.info({ result, state }, "getDeliveryState");

    if (!result.success) {
      await this.client.del(userId);

      return null;
    }

    return result.data;
  }
}
