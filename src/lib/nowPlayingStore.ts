import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { nowPlaying } from "@/db/schema";

const SINGLETON_ID = "singleton";

export async function setReportedTrack(title: string, artist: string) {
  await db
    .insert(nowPlaying)
    .values({ id: SINGLETON_ID, title, artist, reportedAt: new Date() })
    .onConflictDoUpdate({
      target: nowPlaying.id,
      set: { title, artist, reportedAt: new Date() },
    });
}

export async function getReportedTrack(
  maxAgeMs: number,
): Promise<{ title: string; artist: string } | null> {
  const [row] = await db
    .select()
    .from(nowPlaying)
    .where(eq(nowPlaying.id, SINGLETON_ID))
    .limit(1);

  if (!row) return null;
  if (Date.now() - row.reportedAt.getTime() > maxAgeMs) return null;

  return { title: row.title, artist: row.artist };
}
