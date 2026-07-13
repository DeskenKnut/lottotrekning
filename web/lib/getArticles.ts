const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const H = () => ({ apikey: ANON, Authorization: `Bearer ${ANON}` });

export type Article = {
  slug: string; tittel: string; ingress: string | null; brodtekst: string;
  spill: string | null; tema: string | null; bilde: string | null; dato: string;
};

export async function getArticles(filter?: { spill?: string; tema?: string }): Promise<Article[]> {
  if (!URL || !ANON) return [];
  let q = `${URL}/rest/v1/articles?publisert=eq.true&select=slug,tittel,ingress,spill,tema,bilde,dato&order=dato.desc`;
  if (filter?.spill) q += `&spill=eq.${encodeURIComponent(filter.spill)}`;
  if (filter?.tema) q += `&tema=eq.${encodeURIComponent(filter.tema)}`;
  const res = await fetch(q, { headers: H(), next: { revalidate: 300 } });
  return res.ok ? res.json() : [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!URL || !ANON) return null;
  const q = `${URL}/rest/v1/articles?publisert=eq.true&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`;
  const res = await fetch(q, { headers: H(), next: { revalidate: 300 } });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] || null;
}
