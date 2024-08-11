import type { DB } from "@/db/dbServices";

export async function getSessions(db: DB) {
  return await db.query.sessions.findMany({
    columns: {
      expiresAt: true,
    },
    orderBy: (sessions, { desc }) => desc(sessions.expiresAt),
  });
}
