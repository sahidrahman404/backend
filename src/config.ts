export const config = {
  server: {
    port: process.env.PORT || 4444,
    basePath: process.env.BASE_PATH || "http://localhost:4444",
    domain: process.env.DOMAIN || "localhost",
  },
  resend: {
    key: process.env.RESEND_KEY,
  },
  email: {
    from: process.env.EMAIL_FROM || "hello@papiayam.com",
  },
  frontend: {
    basePath: process.env.FRONTEND_BASE_PATH || "http://localhost:3000",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  },
  db: {
    sqlite: {
      path: process.env.SQLITE_PATH || "backend.db",
    },
  },
};
