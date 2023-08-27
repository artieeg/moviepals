import Redis from "ioredis";
import { DateTime } from "luxon";
import { z } from "zod";

import { movieSchema } from "@moviepals/dbmovieswipe/src/movies";

const contentSchema = z.array(movieSchema);

/**
 * Store the latest feed response for the user
 */
export class LatestFeedResponseCache {
  constructor(private client: Redis) {}

  private getKey(reviewStateId: string) {
    return `latest-feed-response:${reviewStateId}`;
  }

  async getLatestFeedResponse(reviewStateId: string) {
    const data = await this.client.get(this.getKey(reviewStateId));

    return data ? contentSchema.parse(JSON.parse(data)) : null;
  }

  private getExpireAt() {
    const date = DateTime.utc().startOf("day").plus({ days: 7 }).toJSDate();

    return Math.floor(date.getTime() / 1000);
  }

  async setLatestFeedResponse(
    reviewStateId: string,
    response: z.infer<typeof contentSchema>,
  ) {
    const pipeline = this.client.pipeline();

    pipeline.set(this.getKey(reviewStateId), JSON.stringify(response));
    pipeline.expireat(this.getKey(reviewStateId), this.getExpireAt());

    await pipeline.exec();
  }
}
