import Link from "next/link";
import Image from "next/image";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { songs } from "@/db/schema";

export default async function LibraryPage({
  searchParams,
}: PageProps<"/library">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const rows = query
    ? await db
        .select()
        .from(songs)
        .where(or(ilike(songs.title, `%${query}%`), ilike(songs.artist, `%${query}%`)))
        .orderBy(desc(songs.lastViewedAt))
    : await db.select().from(songs).orderBy(desc(songs.lastViewedAt));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
      >
        ← 검색으로 돌아가기
      </Link>

      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        저장한 곡
      </h1>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="아티스트 또는 제목으로 검색"
          className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-5 py-2 font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          검색
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          아직 저장한 곡이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
          {rows.map((song) => (
            <li key={song.id}>
              <Link
                href={`/song/${song.geniusId}`}
                prefetch={false}
                className="flex items-center gap-4 py-3 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                {song.thumbnailUrl && (
                  <Image
                    src={song.thumbnailUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded object-cover"
                    unoptimized
                  />
                )}
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {song.title}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {song.artist}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
