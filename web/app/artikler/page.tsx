import Link from "next/link";
import { getArticles } from "../../lib/getArticles";

export const revalidate = 300;

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f" };
const SPILL = [["", "Alle spill"], ["lotto", "Lotto"], ["vikinglotto", "Vikinglotto"], ["eurojackpot", "Eurojackpot"], ["joker", "Joker"]];
const TEMA = [["", "Alle tema"], ["guide", "Guider"], ["statistikk", "Statistikk"], ["forbrukervern", "Forbrukervern"], ["nyhet", "Nyheter"]];

export const metadata = {
  title: "Artikler om lotto, statistikk og spill — Lottoresultater",
  description: "Guider, statistikk og forbrukeropplysning om Lotto, Vikinglotto, Eurojackpot og Joker.",
};

export default async function Artikler({ searchParams }: { searchParams: Promise<{ spill?: string; tema?: string }> }) {
  const sp = await searchParams;
  const articles = await getArticles({ spill: sp.spill, tema: sp.tema });

  return (
    <div style={{ background: C.page, minHeight: "100vh", color: C.ink }}>
      <div style={{ maxWidth: 820, margin: "0 auto", background: C.card, padding: "0 20px 40px" }}>
        <nav style={{ padding: "14px 0", borderBottom: `1px solid ${C.rule}`, fontFamily: "var(--font-ui)", fontSize: 14 }}>
          <Link href="/" style={{ color: C.red, textDecoration: "none" }}>Forside</Link>
          <span style={{ color: C.meta }}> · Artikler</span>
        </nav>

        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px,5vw,42px)", margin: "26px 0 6px" }}>Artikler</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: C.dek, marginTop: 0 }}>
          Guider, statistikk og forbrukeropplysning om norske lotterier.
        </p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "16px 0", fontFamily: "var(--font-ui)", fontSize: 13 }}>
          {SPILL.map(([v, l]) => (
            <FilterLink key={"s" + v} active={(sp.spill || "") === v} href={`/artikler?${new URLSearchParams({ ...(v ? { spill: v } : {}), ...(sp.tema ? { tema: sp.tema } : {}) })}`}>{l}</FilterLink>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, fontFamily: "var(--font-ui)", fontSize: 13 }}>
          {TEMA.map(([v, l]) => (
            <FilterLink key={"t" + v} active={(sp.tema || "") === v} href={`/artikler?${new URLSearchParams({ ...(sp.spill ? { spill: sp.spill } : {}), ...(v ? { tema: v } : {}) })}`}>{l}</FilterLink>
          ))}
        </div>

        {articles.length === 0 ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: C.dek }}>Ingen artikler her ennå.</p>
        ) : (
          articles.map((a) => (
            <article key={a.slug} style={{ padding: "18px 0", borderBottom: `1px solid ${C.rule}` }}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, letterSpacing: 0.5, color: C.meta, textTransform: "uppercase" }}>
                {[a.spill, a.tema].filter(Boolean).join(" · ")}
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(19px,3vw,24px)", margin: "4px 0 6px", lineHeight: 1.2 }}>
                <Link href={`/artikkel/${a.slug}`} style={{ color: C.ink, textDecoration: "none" }}>{a.tittel}</Link>
              </h2>
              {a.ingress && <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: C.dek, margin: 0 }}>{a.ingress}</p>}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      textDecoration: "none", padding: "5px 10px", border: `1px solid ${active ? "#1a1512" : "#c9c2b6"}`,
      background: active ? "#1a1512" : "transparent", color: active ? "#fff" : "#1a1512",
    }}>{children}</Link>
  );
}
