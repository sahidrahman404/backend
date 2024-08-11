import { Lucia } from "lucia";
import { db } from "@/db/dbServices";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions } from "@/session/sessionSchemas";
import { users } from "@/user/userSchemas";
import { Facebook, Google } from "arctic";
import { config } from "@/config";
import { TimeSpan } from "oslo";

export const lucia = new Lucia(new DrizzleSQLiteAdapter(db, sessions, users), {
  sessionExpiresIn: new TimeSpan(2, "w"),
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
      domain: config.server.domain,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      emailVerified: attributes.emailVerified,
      googleId: attributes.googleId,
      facebookId: attributes.facebookId,
      name: attributes.name,
      email: attributes.email,
      createdAt: attributes.createdAt.toJSON(),
    };
  },
});

export const hashConfig = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export const google = new Google(
  config.google.clientId!,
  config.google.clientSecret!,
  `${config.server.basePath}/v1/oauth/google/callback`,
);

export const facebook = new Facebook(
  config.google.clientId!,
  config.google.clientSecret!,
  `${config.server.basePath}/v1/oauth/facebook/callback`,
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      name: string;
      googleId: string;
      facebookId: string;
      emailVerified: boolean;
      createdAt: Date;
    };
  }
}
