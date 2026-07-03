/**
 * Henter siste trekning for et spill fra Supabase.
 * Er ikke Supabase konfigurert ennå (miljøvariabler mangler), returneres null,
 * og siden faller tilbake til seed-data. Da vises noe selv før databasen er koblet på.
 */
export async function getLatestDraw(game: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  try {
    const url =
      `${base}/rest/v1/draws?game=eq.${game.toUpperCase()}` +
      `&order=draw_date.desc&limit=1&select=payload`;
    const res = await fetch(url, {
      headers: { apikey: key },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.payload ?? null;
  } catch {
    return null;
  }
}
