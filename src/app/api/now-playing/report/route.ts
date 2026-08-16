import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setReportedTrack } from "@/lib/nowPlayingStore";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const artist = typeof body?.artist === "string" ? body.artist.trim() : "";

  if (!title || !artist) {
    return NextResponse.json({ error: "title, artist가 필요합니다" }, { status: 400 });
  }

  await setReportedTrack(title, artist);
  return NextResponse.json({ ok: true });
}
