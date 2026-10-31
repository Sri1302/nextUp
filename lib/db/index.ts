import fs from "node:fs";
import path from "node:path";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { env } from "../env";

export type DB = NeonHttpDatabase<typeof schema>;

// Survive dev hot reloads so we never open the local database twice.
const g = globalThis as unknown as { __nextupDb?: Promise<DB> };

export function getDb() {
  return (g.__nextupDb ??= connect());
}

async function connect(): Promise<DB> {
  const url = env("DATABASE_URL");
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set");
  }

  // Local development without Neon: embedded Postgres stored in data/pglite,
  // migrated and seeded with the demo creator automatically.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = path.join(process.cwd(), "data", "pglite");
  fs.mkdirSync(dir, { recursive: true });
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  const { seedDemo } = await import("./seed");
  await seedDemo(db as unknown as DB);
  return db as unknown as DB;
}
