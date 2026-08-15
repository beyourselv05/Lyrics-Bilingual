import type { LyricLine } from "@/db/schema";

const MYMEMORY_API = "https://api.mymemory.translated.net/get";
const CONCURRENCY = 5;

async function translateLine(line: string): Promise<string> {
  try {
    const params = new URLSearchParams({ q: line, langpair: "en|ko" });
    if (process.env.MYMEMORY_EMAIL) params.set("de", process.env.MYMEMORY_EMAIL);

    const res = await fetch(`${MYMEMORY_API}?${params}`);
    if (!res.ok) return "";

    const data = await res.json();
    if (data.responseStatus && data.responseStatus !== 200) return "";
    return data.responseData?.translatedText ?? "";
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
