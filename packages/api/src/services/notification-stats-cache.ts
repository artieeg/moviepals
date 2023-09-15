import Redis from "ioredis";
import { DateTime } from "luxon";
import { z } from "zod";

const schema = z.object({
  received_swipe_notification: z.number(),
  received_daily_swipe_reminder: z.number(),
  received_invite_reminder: z.number(),
});

type NotificationDelivery = z.infer<typeof schema>;

/**
 * Cointains timestamps for when was the
 * latest time a notification of each type was sent
 */
export class NotificationDeliveryCache {
  constructor(private client: Redis) {}

  private getKey(userId: string) {
    return `notification-stats:${userId}`;
  }

  async get(userId: string) {
    const key = this.getKey(userId);

    const result = await this.client.hmget(key);

    if (!result) {
      return null;
    }

    return schema.parse(result);
  }

  async set(userId: string, field: keyof NotificationDelivery, value: number) {
    const key = this.getKey(userId);

    await this.client.hset(key, field, value);
  }
}
