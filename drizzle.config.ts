import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/user/userSchemas.ts",
    "./src/session/sessionSchemas.ts",
    "./src/email-verification-token/emailVerificationTokenSchemas.ts",
    "./src/reset-password-token/resetPasswordTokenSchemas.ts",
  ],
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "backend.db",
  },
});
