import { Lucia } from "lucia";
import { db } from "@/db/dbServices";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions } from "@/session/sessionSchemas";
import { users } from "@/user/userSchemas";

export const lucia = new Lucia(new DrizzleSQLiteAdapter(db, sessions, users), {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      emailVerified: attributes.emailVerified,
      email: attributes.email,
      createdAt: attributes.createdAt,
    };
  },
});

export const hashConfig = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      emailVerified: boolean;
      createdAt: Date;
    };
  }
}
