import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export const sqliteConfig = {
  path: process.env.SQLITE_PATH || "backend.db",
};

const sqlite = new Database(sqliteConfig.path);
const db = drizzle(sqlite);
await migrate(db, { migrationsFolder: "drizzle" });
