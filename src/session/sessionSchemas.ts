import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "@/user/userSchemas";

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  fresh: integer("fresh"),
  expiresAt: integer("expires_at").notNull(),
});
