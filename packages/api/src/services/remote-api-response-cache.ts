import Redis from "ioredis";
import { DateTime } from "luxon";
import { z } from "zod";

import { movieSchema } from "@moviepals/dbmovieswipe/src/movies";

const responseSchema = z.array(movieSchema);

/**
 * Store the latest feed response for the user
 */
export class RemoteApiResponseCache {
  constructor(private client: Redis) {}

  private getKey(qs: string) {
    return `remote-api-response:${qs}`;
  }

  async getCachedResponse(qs: string) {
    const data = await this.client.get(this.getKey(qs));

    return data ? responseSchema.parse(JSON.parse(data)) : null;
  }

  private getExpireAt() {
    const date = DateTime.utc().plus({ hours: 6 }).toJSDate();

    return Math.floor(date.getTime() / 1000);
  }

  async setResponse(
    qs: string,
    response: z.infer<typeof responseSchema>,
  ) {
    const pipeline = this.client.pipeline();

    pipeline.set(this.getKey(qs), JSON.stringify(response));
    pipeline.expireat(this.getKey(qs), this.getExpireAt());

    await pipeline.exec();
  }
}
