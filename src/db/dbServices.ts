import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as users from "@/user/userSchemas";
import * as sessions from "@/session/sessionSchemas";
import * as emailVerificationCodes from "@/email-verification-token/emailVerificationTokenSchemas";
import { config } from "@/config";

const sqlite = new Database(config.db.sqlite.path);
export const db = drizzle(sqlite, {
  schema: {
    ...users,
    ...sessions,
    ...emailVerificationCodes,
  },
});

export type DB = typeof db;
