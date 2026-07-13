import type { MetadataRoute } from "next";

const SITE = "https://lottoresultater.no";
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Faste sider som alltid finnes.
const STATIC = [
  "",                      // forside
  "/lotto",
  "/vikinglotto",
  "/eurojackpot",
  "/joker",
  "/extra",
  "/lykketall",
  "/statistikk",
  "/statistikk/lotto",
  "/statistikk/vikinglotto",
  "/statistikk/eurojackpot",
  "/statistikk/joker",
  "/artikler",
  "/om-oss",
];

// Bygg sitemap på nytt hver time.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1) Faste sider — dette gir alltid en gyldig sitemap.
  const entries: MetadataRoute.Sitemap = STATIC.map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  // 2) Publiserte artikler — legges til HVIS databasen svarer. Feiler aldri bygget.
  try {
    if (SUPA && ANON) {
      const res = await fetch(
        `${SUPA}/rest/v1/articles?publisert=eq.true&select=slug,dato&order=dato.desc`,
        { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` }, next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const rows: { slug: string; dato: string | null }[] = await res.json();
        for (const r of rows) {
          entries.push({
            url: `${SITE}/artikkel/${r.slug}`,
            lastModified: r.dato ? new Date(r.dato) : now,
            changeFrequency: "monthly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Ignorer — sitemap fungerer uansett med de faste sidene.
  }

  return entries;
}
