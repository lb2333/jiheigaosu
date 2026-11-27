import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:jihei_pg_2026@127.0.0.1:5432/jihei_highway';

const globalForDb = globalThis as unknown as {
  __jiheiPgPool?: Pool;
};

export const pool =
  globalForDb.__jiheiPgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__jiheiPgPool = pool;
}

export const db = drizzle(pool, { schema });
export type Database = typeof db;
