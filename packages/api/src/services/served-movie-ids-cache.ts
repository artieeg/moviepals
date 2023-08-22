import Redis from "ioredis";

/**
 * Used to keep the ids of recenly served movies
 * to avoid serving duplicates to the premium users
 * (who make prefetch requests)
 */
export class ServedMovieIdsCache {
  constructor(private client: Redis) {}

  getKey(user: string) {
    return `served_movie_ids:${user}`;
  }

  async addMovieIds(userId: string, movieIds: number[]) {
    const key = this.getKey(userId);

    const pipeline = this.client.pipeline();

    //expire in 10 minutes
    pipeline.sadd(key, movieIds).expire(key, 60 * 10);

    await pipeline.exec();
  }

  async getMovieIds(userId: string): Promise<number[]> {
    const key = this.getKey(userId);

    const ids = await this.client.smembers(key);

    return ids.map((id) => parseInt(id));
  }
}
