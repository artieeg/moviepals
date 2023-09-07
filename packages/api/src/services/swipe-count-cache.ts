import Redis from "ioredis";
import { DateTime } from "luxon";

/**
 * Keep track of how many swipes the user has done
 */
export class SwipeCountCache {
  constructor(private client: Redis) {}

  getKey(user: string) {
    return `swipe_count:${user}`;
  }

  async incSwipeCount(userId: string) {
    const state = await this.getSwipeCount(userId);

    if (!state) {
      await this.setSwipeCount(userId, 1, true);
    } else {
      await this.setSwipeCount(userId, state + 1, false);
    }
  }

  private getExpireAt() {
    const tomorrow = DateTime.utc().startOf("day").plus({ days: 1 }).toJSDate();

    return Math.floor(tomorrow.getTime() / 1000);
  }

  async setSwipeCount(userId: string, swipeCount: number, setExpire: boolean) {
    const pipeline = this.client.pipeline();

    pipeline.set(this.getKey(userId), swipeCount);

    if (setExpire) {
      pipeline.expireat(this.getKey(userId), this.getExpireAt());
    }

    await pipeline.exec();
  }

  async getSwipeCount(userId: string) {
    const state = await this.client.get(this.getKey(userId));

    try {
      if (state === null) {
        return null;
      }

      return parseInt(state);
    } catch (e) {
      return null;
    }
  }
}
