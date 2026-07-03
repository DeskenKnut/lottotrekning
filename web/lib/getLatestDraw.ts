// Henter siste trekning for et spill fra Supabase sitt lese-API.
// Bruker anon-nøkkelen (kun lesing). Ingen kode å endre — sett miljøvariablene i Vercel.

export async function getLatestDraw(game: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null; // miljøvariabler ikke satt ennå

  const url =
    `${base}/rest/v1/draws?game=eq.${game.toUpperCase()}` +
    `&order=draw_date.desc&limit=1&select=payload`;

  try {
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 600 }, // henter ferske data hvert 10. minutt
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.payload ?? null;
  } catch {
    return null;
  }
}
