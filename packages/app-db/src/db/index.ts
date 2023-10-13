import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { env } from "../env";
import { DB } from "./types";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const dialect = new PostgresDialect({
  pool,
});

export const appDb = new Kysely<DB>({
  dialect,
  log(event) {
    if (event.level === "query") {
      //console.log(event.query.sql);
    }
  },
});

export type AppDb = typeof appDb;

export async function connectAppDb() {
  await pool.connect();
}
