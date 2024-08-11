import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "@/user/userSchemas";
import { z } from "zod";

export const emailVerificationToken = sqliteTable("email-verification-tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  email: text("email").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const emailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type EmailVerification = z.infer<typeof emailVerificationSchema>;
