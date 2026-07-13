import type { MetadataRoute } from "next";

const SITE = "https://lottoresultater.no";

// KI-crawlere som henter for SITERING/SØK (sender trafikk tilbake med lenke) — slippes inn.
const AI_CITATION = [
  "OAI-SearchBot",   // ChatGPT-søk (sitering)
  "ChatGPT-User",    // ChatGPT henter på brukerens forespørsel
  "PerplexityBot",   // Perplexity (siterer kilder aktivt)
  "Perplexity-User",
  "ClaudeBot",       // Claude henting
  "Claude-User",
  "Applebot",        // driver Siri/Spotlight-svar
];
// Rene TRENINGS-crawlere (ingen sitering/trafikk) — holdes ute.
const AI_TRAINING = ["GPTBot", "CCBot", "Google-Extended", "anthropic-ai"];
// Aggressive masse-skrapere / SEO-verktøy (ingen verdi, høy skrape-risiko) — holdes ute.
const BULK_SCRAPERS = [
  "Bytespider", "PetalBot", "DataForSeoBot", "MJ12bot", "AhrefsBot",
  "SemrushBot", "DotBot", "Scrapy", "Amazonbot",
];
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Søkemotorer + KI-sitering: full tilgang (unntatt admin/api)
      { userAgent: ["Googlebot", "Bingbot", ...AI_CITATION], allow: "/", disallow: ["/admin", "/api"] },
      // Alle andre: også tillatt som standard
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      // Trening + masse-skrapere: stengt ute
      ...[...AI_TRAINING, ...BULK_SCRAPERS].map((ua) => ({ userAgent: ua, disallow: "/" })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
