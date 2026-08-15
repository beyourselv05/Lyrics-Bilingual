export type ResolvedQuery = {
  searchTerm: string;
  skipToTop: boolean;
};

const SPOTIFY_TRACK_RE = /open\.spotify\.com\/(?:intl-\w+\/)?track\/[a-zA-Z0-9]+/;
const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;

const YOUTUBE_NOISE_RE =
  /[([]?\s*(official\s*(music\s*)?(video|audio)|lyrics?(\s*video)?|audio)\s*[)\]]?/gi;

function cleanYoutubeTitle(title: string): string {
  return title.replace(YOUTUBE_NOISE_RE, " ").replace(/\s{2,}/g, " ").trim();
}

export async function resolveSearchInput(input: string): Promise<ResolvedQuery> {
  const trimmed = input.trim();

  if (SPOTIFY_TRACK_RE.test(trimmed)) {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(trimmed)}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (typeof data.title === "string" && data.title.length > 0) {
        return { searchTerm: data.title, skipToTop: true };
      }
    }
  }

  if (YOUTUBE_RE.test(trimmed)) {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`,
    );
    if (res.ok) {
      const data = await res.json();
      const raw = `${data.author_name ?? ""} ${data.title ?? ""}`.trim();
      if (raw.length > 0) {
        return { searchTerm: cleanYoutubeTitle(raw), skipToTop: true };
      }
    }
  }

  return { searchTerm: trimmed, skipToTop: false };
}
