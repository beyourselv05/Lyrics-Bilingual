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
  const token = process.env.GENIUS_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "GENIUS_ACCESS_TOKEN 환경변수가 설정되지 않았습니다 (로컬은 .env.local, 배포는 Vercel 환경변수)",
    );
  }
  return { Authorization: `Bearer ${token}` };
}

// Genius 응답 실패 시 상태 코드를 남겨서 원인(인증/한도/장애)을 구분할 수 있게 한다.
async function geniusError(message: string, res: Response) {
  const detail = await res.text().catch(() => "");
  const hint =
    res.status === 401 || res.status === 403
      ? " — 토큰이 잘못되었거나 만료되었습니다"
      : "";
  return `${message} (HTTP ${res.status}${hint}) ${detail.slice(0, 200)}`.trim();
}

export async function searchGenius(
  query: string,
): Promise<GeniusSearchResult[]> {
  const res = await fetch(
    `${GENIUS_API_BASE}/search?q=${encodeURIComponent(query)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(await geniusError("Genius 검색에 실패했습니다", res));

  const data = await res.json();
  const hits: { result: GeniusSongResult }[] = data.response.hits;

  return hits
    .filter((hit) => hit.result && !hit.result.primary_artist.name.startsWith("Genius "))
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
  if (!res.ok) throw new Error(await geniusError("곡 정보를 가져오지 못했습니다", res));

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
    $el.find('[data-exclude-from-selection="true"]').remove();
    $el.find("br").replaceWith("\n");
    parts.push($el.text());
  });

  if (parts.length === 0) throw new Error("가사를 찾을 수 없습니다");

  return parts.join("\n\n").trim();
}
