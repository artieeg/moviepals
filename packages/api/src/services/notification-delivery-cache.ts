import Redis from "ioredis";
import { DateTime } from "luxon";
import { z } from "zod";

import { movieSchema } from "@moviepals/dbmovieswipe/src/movies";

const schema = z.object({
  received_swipe_notification: z.boolean(),
  received_daily_swipe_reminder: z.boolean(),
  received_invite_reminder: z.boolean(),
});

/**
 * 
 */
export class NotificationStatsCache {
  constructor(private client: Redis) {}

  private getKey(userId: string) {
    return `notification-stats:${userId}`;
  }

  private getExpireAt() {
    const date = DateTime.utc().startOf("day").plus({ days: 1 }).toJSDate();

    return Math.floor(date.getTime() / 1000);
  }
}
