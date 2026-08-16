"use client";

import { useEffect, useRef, useState } from "react";
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

const STATUS_POLL_MS = 2000;

export function NowPlayingWidget() {
  const [playing, setPlaying] = useState(false);
  const [song, setSong] = useState<Song | null>(null);
  const [notFound, setNotFound] = useState<{ title: string; artist: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const resolvedTrackKey = useRef<string | null>(null);
  const statusInFlight = useRef(false);
  const resolveInFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve(trackKey: string, title: string, artist: string) {
      resolveInFlight.current = true;
      setResolving(true);

      try {
        const res = await fetch(
          `/api/now-playing/resolve?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
        );
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "가사를 불러오지 못했습니다");
          return;
        }

        setError(null);
        if (data.song) {
          setSong(data.song);
          setNotFound(null);
        } else {
          setSong(null);
          setNotFound({ title, artist });
        }
        resolvedTrackKey.current = trackKey;
      } catch {
        if (!cancelled) setError("가사를 불러오지 못했습니다");
      } finally {
        resolveInFlight.current = false;
        if (!cancelled) setResolving(false);
      }
    }

    async function checkStatus() {
      if (statusInFlight.current) return;
      statusInFlight.current = true;

      try {
        const res = await fetch("/api/now-playing");
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "오류가 발생했습니다");
          return;
        }

        setPlaying(data.playing);
        if (!data.playing) {
          resolvedTrackKey.current = null;
          setSong(null);
          setNotFound(null);
          setError(null);
          return;
        }

        if (data.trackKey !== resolvedTrackKey.current && !resolveInFlight.current) {
          resolve(data.trackKey, data.title, data.artist);
        }
      } catch {
        if (!cancelled) setError("재생 정보를 가져오지 못했습니다");
      } finally {
        statusInFlight.current = false;
      }
    }

    checkStatus();
    const id = setInterval(checkStatus, STATUS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!playing && !error) return null;

  return (
    <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        지금 재생 중
      </h2>

      {error && <p className="text-sm text-neutral-500 dark:text-neutral-400">{error}</p>}

      {playing && resolving && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-50" />
          가사를 불러오는 중…
        </div>
      )}

      {playing && !resolving && notFound && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          &ldquo;{notFound.artist} - {notFound.title}&rdquo; 가사를 찾지 못했습니다
        </p>
      )}

      {playing && !resolving && song && (
        <>
          <div className="flex items-center gap-4">
            {song.thumbnailUrl && (
              <div className="relative h-16 w-24 shrink-0">
                <Image
                  src={song.thumbnailUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="absolute top-1/2 left-8 h-16 w-16 -translate-y-1/2 animate-[spin_3s_linear_infinite] rounded-full object-cover shadow-md ring-2 ring-neutral-900/80 dark:ring-neutral-950"
                  unoptimized
                />
                <span className="pointer-events-none absolute top-1/2 left-16 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 dark:bg-neutral-950" />
                <Image
                  src={song.thumbnailUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="relative z-10 h-16 w-16 rounded object-cover shadow-lg ring-1 ring-neutral-300 dark:ring-neutral-700"
                  unoptimized
                />
              </div>
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
    </div>
  );
}
