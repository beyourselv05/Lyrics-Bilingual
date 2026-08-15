import Link from "next/link";
import { getOrCreateSong } from "@/lib/song";
import { LyricsView } from "@/components/LyricsView";

export default async function SongPage({
  params,
}: PageProps<"/song/[geniusId]">) {
  const { geniusId } = await params;
  const song = await getOrCreateSong(geniusId);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
      >
        ← 검색으로 돌아가기
      </Link>

      <header>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {song.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">{song.artist}</p>
      </header>

      <LyricsView lines={song.lyrics} />
    </main>
  );
}
