import type { LyricLine } from "@/db/schema";

const GOOGLE_TRANSLATE_API = "https://translate.googleapis.com/translate_a/single";
const CONCURRENCY = 5;

async function translateLine(line: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: "en",
      tl: "ko",
      dt: "t",
      q: line,
    });

    const res = await fetch(`${GOOGLE_TRANSLATE_API}?${params}`);
    if (!res.ok) return "";

    const data = await res.json();
    const segments = data?.[0];
    if (!Array.isArray(segments)) return "";

    return segments.map((segment: [string]) => segment[0]).join("");
  } catch {
    return "";
  }
}

export async function translateLyrics(lines: string[]): Promise<LyricLine[]> {
  const translations = new Array<string>(lines.length).fill("");

  for (let i = 0; i < lines.length; i += CONCURRENCY) {
    const batch = lines.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((line) =>
        line.trim() === "" ? Promise.resolve("") : translateLine(line),
      ),
    );
    results.forEach((translation, j) => {
      translations[i + j] = translation;
    });
  }

  return lines.map((line, i) => ({ line, translation: translations[i] }));
}
