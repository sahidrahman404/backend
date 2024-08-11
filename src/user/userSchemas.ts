import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  emailVerified: integer("email_verified", { mode: "boolean" }),
  googleId: text("google_id").unique(),
  facebookId: text("facebook_id").unique(),
  loggedInCount: integer("logged_in_count").notNull().default(0),
  lastLoggedOutAt: integer("last_logged_out_at", { mode: "timestamp" }),
  createdAt: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const userPasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character",
  })
  .regex(/\d/, { message: "Password must contain at least one digit" })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  });

export const userRegistrationSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .transform((value) =>
      value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    ),
  email: z.string().email("Invalid email address"),
  password: userPasswordSchema,
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: userPasswordSchema,
});

export type UserLogin = z.infer<typeof userLoginSchema>;

export const updateUserNameSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 characters long"),
});

export type UpdateUserName = z.infer<typeof updateUserNameSchema>;

export const resetPasswordSchema = z.object({
  oldPassword: userPasswordSchema,
  newPassword: userPasswordSchema,
});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;
