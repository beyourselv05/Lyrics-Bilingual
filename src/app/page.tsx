"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NowPlayingWidget } from "@/components/NowPlayingWidget";

type SearchResult = {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string | null;
};

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "검색에 실패했습니다");

      if (data.skipToTop && data.results[0]) {
        router.push(`/song/${data.results[0].id}`);
        return;
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Lyrics Bilingual
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            영어 원문과 한국어 가사를 동시에
            <span
              aria-label="영어 가사와 한국어를 선택적으로 보고 좋아하는 노래를 들으며 영어 공부를 해보세요!!"
              className="group relative inline-flex cursor-help"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-neutral-400 dark:text-neutral-500"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 9a1 1 0 0 1 2 0v4a1 1 0 1 1-2 0V9Zm1-4a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 10 5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-md bg-neutral-900 px-3 py-2 text-xs font-normal text-neutral-50 opacity-0 shadow-lg group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
                영어 가사와 한국어를 선택적으로 보고 좋아하는 노래를 들으며 영어 공부를 해보세요!!
              </span>
            </span>
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="아티스트, 곡 제목, 또는 URL"
            className="w-40 rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:outline-none sm:w-56 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-neutral-900 px-5 py-2 font-medium text-neutral-50 transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? "검색 중…" : "검색"}
          </button>
        </form>
      </header>

      {error && <p className="text-sm text-neutral-500 dark:text-neutral-400">{error}</p>}

      <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
        {results.map((r) => (
          <li key={r.id}>
            <Link
              href={`/song/${r.id}`}
              prefetch={false}
              className="flex items-center gap-4 py-3 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              {r.thumbnailUrl && (
                <Image
                  src={r.thumbnailUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded object-cover"
                  unoptimized
                />
              )}
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-50">
                  {r.title}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {r.artist}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <NowPlayingWidget />
    </main>
  );
}
