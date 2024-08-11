import { Cookie } from "lucia";
import type { DB } from "@/db/dbServices";
import { getUsersCountService } from "@/user/userServices";
import { getSessions } from "@/session/sessionRepositories";

export function convertSessionCookieMaxAgeToMsInPlace(sessionCookie: Cookie) {
  const maxAge = sessionCookie.attributes["maxAge"]!;
  sessionCookie.attributes["maxAge"] = maxAge * 1000;
}

export async function getSessionStats(db: DB) {
  const data = await db.transaction(async (tx) => {
    const users = await getUsersCountService(db);
    const sessions = await getSessions(db);
    const usersCount = users[0] ? users[0].count : 0;
    const activeSessionsCount = sessions.length;
    const lastSevenDays = sessions.filter((session) => {
      const sessionDate = new Date(session.expiresAt * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return sessionDate >= sevenDaysAgo;
    });

    const activeSessionsByDay = lastSevenDays.reduce(
      (acc, session) => {
        const sessionDate = new Date(session.expiresAt * 1000)
          .toISOString()
          .slice(0, 10);
        if (!acc[sessionDate]) {
          acc[sessionDate] = 0;
        }
        acc[sessionDate]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    const activeSessionsPerDay = Object.values(activeSessionsByDay);
    const averageActiveSessions =
      activeSessionsPerDay.reduce((sum, count) => sum + count, 0) /
      activeSessionsPerDay.length;
    return {
      usersCount,
      activeSessionsCount,
      averageActiveSessions,
    };
  });
  return data;
}
