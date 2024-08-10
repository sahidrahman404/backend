export const config = {
  server: {
    port: process.env.PORT || 4444,
    basePath: process.env.BASE_PATH || "http://localhost:4444",
  },
  resend: {
    key: process.env.RESEND_KEY,
  },
  db: {
    sqlite: {
      path: process.env.SQLITE_PATH || "backend.db",
    },
  },
};
