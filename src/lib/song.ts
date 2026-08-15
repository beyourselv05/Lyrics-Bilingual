import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { songs } from "@/db/schema";
import { getGeniusSongById, scrapeGeniusLyrics } from "./genius";
import { translateLyrics } from "./translate";

export async function getOrCreateSong(geniusId: string) {
  const [existing] = await db
    .select()
    .from(songs)
    .where(eq(songs.geniusId, geniusId))
    .limit(1);

  if (existing) {
    await db
      .update(songs)
      .set({ lastViewedAt: new Date() })
      .where(eq(songs.geniusId, geniusId));
    return existing;
  }

  const meta = await getGeniusSongById(geniusId);
  const rawLyrics = await scrapeGeniusLyrics(meta.url);
  const lyrics = await translateLyrics(rawLyrics.split("\n"));

  try {
    const [saved] = await db
      .insert(songs)
      .values({
        geniusId,
        title: meta.title,
        artist: meta.artist,
        thumbnailUrl: meta.thumbnailUrl,
        lyrics,
      })
      .returning();

    return saved;
  } catch (err) {
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause : err;
    const code = (cause as { code?: string }).code;
    if (code !== "23505") throw err;

    const [winner] = await db
      .select()
      .from(songs)
      .where(eq(songs.geniusId, geniusId))
      .limit(1);
    if (!winner) throw err;
    return winner;
  }
}
