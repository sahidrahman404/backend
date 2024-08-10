import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userPasswordSchema, users } from "@/user/userSchemas";
import { z } from "zod";

export const resetPasswordTokens = sqliteTable("reset-password-tokens", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const resetPasswordTokenSchema = z.object({
  email: z.string().email(),
});

export type ResetPasswordToken = z.infer<typeof resetPasswordTokenSchema>;

export const resetPasswordSchema = z.object({
  password: userPasswordSchema,
});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;
