import Redis from "ioredis";
import { DateTime } from "luxon";

/**
 * Keep track of how many ads the user has viewed
 */
export class WatchedAdCountCache {
  constructor(private client: Redis) {}

  getKey(user: string) {
    return `viewed_ads:${user}`;
  }

  async incWatchedAdsCount(userId: string) {
    const state = await this.getWatchedAdsCount(userId);

    if (!state) {
      await this.setWatchedAdsCount(userId, 1, true);
    } else {
      await this.setWatchedAdsCount(userId, state + 1, false);
    }
  }

  private getExpireAt() {
    const tomorrow = DateTime.utc().startOf("day").plus({ days: 1 }).toJSDate();

    return Math.floor(tomorrow.getTime() / 1000);
  }

  async setWatchedAdsCount(
    userId: string,
    watchedAdsCount: number,
    setExpire: boolean,
  ) {
    const pipeline = this.client.pipeline();

    pipeline.set(this.getKey(userId), watchedAdsCount);

    if (setExpire) {
      pipeline.expireat(this.getKey(userId), this.getExpireAt());
    }

    await pipeline.exec();
  }

  async getWatchedAdsCount(userId: string): Promise<number> {
    const state = await this.client.get(this.getKey(userId));

    try {
      if (state === null) {
        return 0;
      }

      return parseInt(state);
    } catch (e) {
      return 0;
    }
  }
}
