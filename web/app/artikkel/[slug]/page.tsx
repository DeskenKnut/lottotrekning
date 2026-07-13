import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "../../../lib/getArticles";
import { mdToHtml } from "../../../lib/markdown";

export const revalidate = 300;

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return {};
  return { title: `${a.tittel} — Lottotrekning`, description: a.ingress || undefined };
}

export default async function Artikkel({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();

  const html = mdToHtml(a.brodtekst);
  const dato = new Date(a.dato).toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.tittel,
    description: a.ingress || undefined,
    datePublished: a.dato,
    author: { "@type": "Organization", name: "Desken AS" },
    publisher: { "@type": "Organization", name: "Lottotrekning", legalName: "Desken AS" },
  };

  return (
    <div style={{ background: C.page, minHeight: "100vh", color: C.ink }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", background: C.card, padding: "0 20px 48px" }}>
        <nav style={{ padding: "14px 0", borderBottom: `1px solid ${C.rule}`, fontFamily: "var(--font-ui)", fontSize: 14 }}>
          <Link href="/" style={{ color: C.red, textDecoration: "none" }}>Forside</Link>
          <span style={{ color: C.meta }}> · </span>
          <Link href="/artikler" style={{ color: C.red, textDecoration: "none" }}>Artikler</Link>
        </nav>

        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, letterSpacing: 0.5, color: C.meta, textTransform: "uppercase", marginTop: 26 }}>
          {[a.spill, a.tema].filter(Boolean).join(" · ")} {a.spill || a.tema ? "·" : ""} {dato}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px,5.5vw,44px)", lineHeight: 1.08, margin: "8px 0 14px" }}>
          {a.tittel}
        </h1>
        {a.ingress && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.5, color: C.ink, fontStyle: "italic", margin: "0 0 20px" }}>
            {a.ingress}
          </p>
        )}

        <div className="artikkel-brodtekst" dangerouslySetInnerHTML={{ __html: html }} />

        <style>{`
          .artikkel-brodtekst { font-family: var(--font-body); font-size: 17px; line-height: 1.65; color: ${C.ink}; }
          .artikkel-brodtekst h1, .artikkel-brodtekst h2, .artikkel-brodtekst h3 { font-family: var(--font-display); font-weight: 700; line-height: 1.2; margin: 28px 0 8px; }
          .artikkel-brodtekst h2 { font-size: 25px; }
          .artikkel-brodtekst h3 { font-size: 20px; }
          .artikkel-brodtekst p { margin: 0 0 14px; }
          .artikkel-brodtekst ul { margin: 0 0 14px; padding-left: 22px; }
          .artikkel-brodtekst li { margin-bottom: 6px; }
          .artikkel-brodtekst a { color: ${C.red}; }
          .artikkel-brodtekst hr { border: none; border-top: 1px solid ${C.rule}; margin: 24px 0; }
          .artikkel-brodtekst strong { font-weight: 700; }
        `}</style>

        <div style={{ marginTop: 30, paddingTop: 16, borderTop: `1px solid ${C.rule}` }}>
          <Link href="/artikler" style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: C.red, textDecoration: "underline" }}>← Alle artikler</Link>
        </div>
      </div>
    </div>
  );
}
