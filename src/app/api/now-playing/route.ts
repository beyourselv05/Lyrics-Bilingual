import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchGenius } from "@/lib/genius";
import { getOrCreateSong } from "@/lib/song";
import { getReportedTrack } from "@/lib/nowPlayingStore";

const REPORT_MAX_AGE_MS = 15_000;

export async function GET(request: NextRequest) {
  const reported = getReportedTrack(REPORT_MAX_AGE_MS);
  if (!reported) {
    return NextResponse.json({ playing: false });
  }

  const trackKey = `${reported.artist}::${reported.title}`;
  const known = request.nextUrl.searchParams.get("known");
  if (known === trackKey) {
    return NextResponse.json({ playing: true, trackKey, unchanged: true });
  }

  try {
    const [top] = await searchGenius(`${reported.artist} ${reported.title}`);
    if (!top) {
      return NextResponse.json({
        playing: true,
        trackKey,
        song: null,
        title: reported.title,
        artist: reported.artist,
      });
    }

    const song = await getOrCreateSong(top.id);
    return NextResponse.json({
      playing: true,
      trackKey,
      song: {
        geniusId: top.id,
        title: song.title,
        artist: song.artist,
        thumbnailUrl: song.thumbnailUrl,
        lyrics: song.lyrics,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "가사를 불러오지 못했습니다" },
      { status: 500 },
    );
  }
}
