import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchGenius } from "@/lib/genius";
import { getOrCreateSong } from "@/lib/song";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const artist = request.nextUrl.searchParams.get("artist");
  if (!title || !artist) {
    return NextResponse.json({ error: "title, artist가 필요합니다" }, { status: 400 });
  }

  try {
    const [top] = await searchGenius(`${artist} ${title}`);
    if (!top) {
      return NextResponse.json({ song: null, title, artist });
    }

    const song = await getOrCreateSong(top.id);
    return NextResponse.json({
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
