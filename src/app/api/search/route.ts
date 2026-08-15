import type { NextRequest } from "next/server";
import { searchGenius } from "@/lib/genius";
import { resolveSearchInput } from "@/lib/resolveQuery";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return Response.json({ error: "검색어를 입력해주세요" }, { status: 400 });
  }

  try {
    const { searchTerm, skipToTop } = await resolveSearchInput(q);
    const results = await searchGenius(searchTerm);
    return Response.json({ results, skipToTop });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "검색 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
