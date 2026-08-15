const GENIUS_API_BASE = "https://api.genius.com";

export type GeniusSearchResult = {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string | null;
};

type GeniusSongResult = {
  id: number;
  title: string;
  url: string;
  primary_artist: { name: string };
  song_art_image_thumbnail_url: string | null;
};

function authHeaders() {
  return { Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}` };
}

export async function searchGenius(
  query: string,
): Promise<GeniusSearchResult[]> {
  const res = await fetch(
    `${GENIUS_API_BASE}/search?q=${encodeURIComponent(query)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error("Genius 검색에 실패했습니다");

  const data = await res.json();
  const hits: { result: GeniusSongResult }[] = data.response.hits;

  return hits
    .filter((hit) => hit.result)
    .map((hit) => ({
      id: String(hit.result.id),
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      thumbnailUrl: hit.result.song_art_image_thumbnail_url,
    }));
}

export async function getGeniusSongById(geniusId: string) {
  const res = await fetch(`${GENIUS_API_BASE}/songs/${geniusId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("곡 정보를 가져오지 못했습니다");

  const data = await res.json();
  const song: GeniusSongResult = data.response.song;

  return {
    title: song.title,
    artist: song.primary_artist.name,
    thumbnailUrl: song.song_art_image_thumbnail_url,
    url: song.url,
  };
}

export async function scrapeGeniusLyrics(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  if (!res.ok) throw new Error("가사 페이지를 불러오지 못했습니다");

  const html = await res.text();
  const { load } = await import("cheerio");
  const $ = load(html);

  const parts: string[] = [];
  $('div[data-lyrics-container="true"]').each((_, el) => {
    const $el = $(el);
    $el.find("br").replaceWith("\n");
    parts.push($el.text());
  });

  if (parts.length === 0) throw new Error("가사를 찾을 수 없습니다");

  return parts.join("\n\n").trim();
}
