import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
export const hasDb = Boolean(databaseUrl && databaseUrl.trim().length > 0);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool: Pool | null =
  hasDb && databaseUrl
    ? globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      })
    : null;

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db: NodePgDatabase<Record<string, never>> = pool
  ? drizzle(pool)
  : (new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === "then") return undefined;
          return () => {
            throw new Error(`Database operation attempted but DATABASE_URL is not set.`);
          };
        },
      },
    ) as any);
