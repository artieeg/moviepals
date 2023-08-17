import Redis from "ioredis";
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
      this.setDeliveryState(userId, {
        page: 0,
        ads_watched: 1,
      });
    } else {
      this.setDeliveryState(userId, {
        ...state,
        ads_watched: state.ads_watched + 1,
      });
    }
  }

  async setDeliveryState(userId: string, state: UserFeedDeliveryState) {
    return this.client.hmset(userId, state);
  }

  async getDeliveryState(userId: string) {
    const state = await this.client.hgetall(userId);

    if (!state) {
      return null;
    }

    return userFeedDeliveryStateSchema.parse(state);
  }
}
