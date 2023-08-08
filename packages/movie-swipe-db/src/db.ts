import { MongoClient } from "mongodb";

import { env } from "./env";

const client = new MongoClient(env.MOVIE_SWIPE_DATABASE_URL);

export const db = client.db(env.MOVIE_SWIPE_DB_NAME);

export async function connect() {
  await client.connect();
}
