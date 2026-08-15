"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LyricsView } from "@/components/LyricsView";
import type { LyricLine } from "@/db/schema";

type Song = {
  geniusId: string;
  title: string;
  artist: string;
  thumbnailUrl: string | null;
  lyrics: LyricLine[];
};

const POLL_INTERVAL_MS = 5000;

export default function NowPlayingPage() {
  const [playing, setPlaying] = useState(false);
  const [song, setSong] = useState<Song | null>(null);
  const [notFound, setNotFound] = useState<{ title: string; artist: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const lastTrackId = useRef<string | null>(null);
  const hasContent = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        if (!hasContent.current) setLoading(true);

        const known = lastTrackId.current ?? "";
        const res = await fetch(`/api/now-playing?known=${encodeURIComponent(known)}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "오류가 발생했습니다");
          setLoading(false);
          return;
        }

        setError(data.error ?? null);
        setPlaying(data.playing);
        if (!data.playing) {
          lastTrackId.current = null;
          setSong(null);
          setNotFound(null);
          hasContent.current = false;
          setLoading(false);
          return;
        }

        lastTrackId.current = data.trackKey;
        if (data.unchanged) {
          setLoading(false);
          return;
        }

        if (data.song) {
          setSong(data.song);
          setNotFound(null);
        } else {
          setSong(null);
          setNotFound({ title: data.title ?? "", artist: data.artist ?? "" });
        }
        hasContent.current = true;
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("재생 정보를 가져오지 못했습니다");
          setLoading(false);
        }
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

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
          지금 재생 중
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Spotify에서 재생 중인 곡을 자동으로 인식해 번역해드려요
        </p>
      </header>

      {loading && !song && !notFound && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-50" />
          가사를 불러오는 중…
        </div>
      )}

      {error && <p className="text-sm text-neutral-500 dark:text-neutral-400">{error}</p>}

      {!playing && !error && !loading && (
        <p className="text-neutral-500 dark:text-neutral-400">
          현재 Spotify에서 재생 중인 곡이 없습니다. 리포터 스크립트가 실행 중인지 확인해주세요.
        </p>
      )}

      {playing && notFound && (
        <p className="text-neutral-500 dark:text-neutral-400">
          &ldquo;{notFound.artist} - {notFound.title}&rdquo; 가사를 찾지 못했습니다
        </p>
      )}

      {song && (
        <>
          <div className="flex items-center gap-4">
            {song.thumbnailUrl && (
              <Image
                src={song.thumbnailUrl}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded object-cover"
                unoptimized
              />
            )}
            <div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                {song.title}
              </p>
              <p className="text-neutral-500 dark:text-neutral-400">{song.artist}</p>
            </div>
          </div>

          <LyricsView lines={song.lyrics} />
        </>
      )}
    </main>
  );
}
