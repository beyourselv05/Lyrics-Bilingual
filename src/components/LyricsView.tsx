"use client";

import { useState } from "react";
import type { LyricLine } from "@/db/schema";

export function LyricsView({ lines }: { lines: LyricLine[] }) {
  const [blurred, setBlurred] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          한국어 가리기
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={blurred}
          onClick={() => setBlurred((v) => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            blurred
              ? "bg-neutral-900 dark:bg-neutral-50"
              : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform dark:bg-neutral-900 ${
              blurred ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
        {lines.map((l, i) => (
          <div key={i} className="contents">
            <p className="whitespace-pre-wrap text-neutral-900 dark:text-neutral-50">
              {l.line || " "}
            </p>
            <p
              className={`whitespace-pre-wrap text-neutral-600 transition-[filter] duration-200 dark:text-neutral-400 ${
                blurred ? "select-none blur-sm" : ""
              }`}
            >
              {l.translation || " "}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
