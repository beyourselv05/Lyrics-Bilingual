import { NextResponse } from "next/server";
import { getReportedTrack } from "@/lib/nowPlayingStore";

const REPORT_MAX_AGE_MS = 15_000;

export async function GET() {
  const reported = await getReportedTrack(REPORT_MAX_AGE_MS);
  if (!reported) {
    return NextResponse.json({ playing: false });
  }

  return NextResponse.json({
    playing: true,
    trackKey: `${reported.artist}::${reported.title}`,
    title: reported.title,
    artist: reported.artist,
  });
}
