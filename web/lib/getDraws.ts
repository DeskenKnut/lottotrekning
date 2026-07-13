const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type Draw = { draw_date: string; payload: any };

// Henter ALLE trekninger for et spill. Paginerer (Supabase gir maks 1000 pr kall).
export async function getAllDraws(gameValue: string): Promise<Draw[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return [];
  const out: Draw[] = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const url = `${SUPABASE_URL}/rest/v1/draws?game=eq.${encodeURIComponent(gameValue)}` +
      `&select=draw_date,payload&order=draw_date.asc&offset=${offset}&limit=${PAGE}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;
    const batch: Draw[] = await res.json();
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}
