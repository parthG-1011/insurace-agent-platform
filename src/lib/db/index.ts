import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: postgres.Sql | undefined;
let instance: PostgresJsDatabase<typeof schema> | undefined;

/** Lazily connects so builds and tests don't need DATABASE_URL. */
export function db() {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    // prepare:false keeps it compatible with Neon's pgbouncer pooler.
    client = postgres(url, { max: 1, prepare: false });
    instance = drizzle(client, { schema });
  }
  return instance;
}

export async function closeDb() {
  await client?.end();
  client = undefined;
  instance = undefined;
}
