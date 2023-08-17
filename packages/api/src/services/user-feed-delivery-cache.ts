import Redis from "ioredis";
import { DateTime } from "luxon";
import { z } from "zod";

const userFeedDeliveryStateSchema = z.object({
  page: z.number(),
  ads_watched: z.number(),
});

export type UserFeedDeliveryState = z.infer<typeof userFeedDeliveryStateSchema>;

/**
 * Keeps track of:
 * 1. how many pages we've already served to the user during the day
 * 2. how many pages the user is allowed based on how many ads they've watched
 */
export class UserFeedDeliveryCache {
  constructor(private client: Redis) {}

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
  }

  async getDeliveryState(userId: string) {
    const state = await this.client.hgetall(userId);

    const result = userFeedDeliveryStateSchema.safeParse(state);

    if (!result.success) {
      await this.client.del(userId);

      return null;
    }

    return result.data;
  }
}
