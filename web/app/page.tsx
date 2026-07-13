import Link from "next/link";
import { getArticles } from "../lib/getArticles";

export const revalidate = 300;

export const metadata = {
  title: "Lottoresultater – siste vinnertall og trekning for Lotto, Vikinglotto, Eurojackpot og Joker",
  description:
    "Siste lottoresultater og vinnertall fra Lotto, Vikinglotto, Eurojackpot og Joker. Uavhengig tjeneste med statistikk, lykketallgenerator og over ti år med trekninger.",
};

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f", gold: "#c9a34a" };
const DISPLAY = "var(--font-display, Georgia, serif)";
const BODY = "var(--font-body, Georgia, serif)";
const UI = "var(--font-ui, system-ui, sans-serif)";
const PAD = "clamp(20px, 4vw, 40px)";

const NAV = [
  ["Lotto", "/lotto"], ["Vikinglotto", "/vikinglotto"], ["Eurojackpot", "/eurojackpot"],
  ["Joker", "/joker"], ["Lykketall", "/lykketall"], ["Statistikk", "/statistikk"], ["Artikler", "/artikler"],
];

const GAMES = [
  { slug: "lotto", label: "Lotto", desc: "Trekning hver lørdag – 7 tall av 34" },
  { slug: "vikinglotto", label: "Vikinglotto", desc: "Trekning hver onsdag – 6 tall + vikingtall" },
  { slug: "eurojackpot", label: "Eurojackpot", desc: "Trekning hver fredag – 5 tall + stjernetall" },
  { slug: "joker", label: "Joker", desc: "Trekning onsdag og lørdag – 5 sifre" },
];

export default async function Home() {
  const articles = (await getArticles()).slice(0, 4);

  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.page, minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "clamp(360px, 94vw, 960px)", background: C.card, minHeight: "100vh", display: "flex", flexDirection: "column", color: C.ink }}>
        {/* Masthead */}
        <header style={{ borderBottom: `2px solid ${C.ink}`, padding: `18px ${PAD} 0` }}>
          <Link href="/" style={{ display: "block", textDecoration: "none", color: C.ink, textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(32px,7vw,58px)", letterSpacing: "-0.5px", lineHeight: 1 }}>Lottoresultater</div>
            <div style={{ fontFamily: UI, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.meta, margin: "8px 0 14px" }}>Norske lottoresultater og trekning</div>
          </Link>
          <nav style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${C.rule}`, padding: "10px 0" }}>
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} style={{ fontFamily: UI, fontSize: 13, letterSpacing: 0.3, textDecoration: "none", padding: "4px 11px", color: C.ink, fontWeight: 500 }}>{label}</Link>
            ))}
          </nav>
        </header>

        <main style={{ padding: `30px ${PAD}`, flex: 1 }}>
          {/* Ingress */}
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,4.5vw,40px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 10px" }}>
            Siste lottoresultater og vinnertall
          </h1>
          <p style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: C.dek, maxWidth: 640, margin: 0 }}>
            Velg et spill for å se de nyeste vinnertallene, premiene og nedtelling til neste trekning. Vi har levert norske lottoresultater i over ti år.
          </p>

          {/* Spill-grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 24 }}>
            {GAMES.map((g) => (
              <Link key={g.slug} href={`/${g.slug}`} style={{ border: `1px solid ${C.rule}`, background: C.card, padding: 20, textDecoration: "none", color: C.ink, borderRadius: 2 }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22 }}>{g.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 14, color: C.dek, margin: "4px 0 10px" }}>{g.desc}</div>
                <div style={{ fontFamily: UI, fontSize: 13, color: C.red, fontWeight: 600 }}>Se resultater →</div>
              </Link>
            ))}
          </div>

          {/* Verktøy: Lykketall + Statistikk */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 16 }}>
            <Link href="/lykketall" style={{ border: `1px solid ${C.ink}`, background: C.ink, padding: 20, textDecoration: "none", color: "#fdfcfa", borderRadius: 2 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20 }}>Lykketallgenerator</div>
              <div style={{ fontFamily: BODY, fontSize: 14, color: "#e9e6df", margin: "4px 0 10px" }}>Trekk en tilfeldig rekke til spillet du velger.</div>
              <div style={{ fontFamily: UI, fontSize: 13, color: C.gold, fontWeight: 600 }}>Prøv generatoren →</div>
            </Link>
            <Link href="/statistikk" style={{ border: `1px solid ${C.rule}`, background: C.card, padding: 20, textDecoration: "none", color: C.ink, borderRadius: 2 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20 }}>Statistikk</div>
              <div style={{ fontFamily: BODY, fontSize: 14, color: C.dek, margin: "4px 0 10px" }}>Hvilke tall er trukket oftest? Over ti år med data.</div>
              <div style={{ fontFamily: UI, fontSize: 13, color: C.red, fontWeight: 600 }}>Se statistikken →</div>
            </Link>
          </div>

          {/* Siste artikler (fra databasen) */}
          {articles.length > 0 && (
            <section style={{ marginTop: 34 }}>
              <h2 style={{ fontFamily: UI, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.meta, borderBottom: `2px solid ${C.ink}`, paddingBottom: 6, margin: "0 0 4px" }}>Siste artikler</h2>
              {articles.map((a) => (
                <article key={a.slug} style={{ padding: "16px 0", borderBottom: `1px solid ${C.rule}` }}>
                  <div style={{ fontFamily: UI, fontSize: 12, letterSpacing: 0.5, color: C.meta, textTransform: "uppercase" }}>
                    {[a.spill, a.tema].filter(Boolean).join(" · ")}
                  </div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(18px,2.6vw,22px)", margin: "4px 0 6px", lineHeight: 1.2 }}>
                    <Link href={`/artikkel/${a.slug}`} style={{ color: C.ink, textDecoration: "none" }}>{a.tittel}</Link>
                  </h3>
                  {a.ingress && <p style={{ fontFamily: BODY, fontSize: 15.5, color: C.dek, margin: 0, lineHeight: 1.5 }}>{a.ingress}</p>}
                </article>
              ))}
              <div style={{ marginTop: 14 }}>
                <Link href="/artikler" style={{ fontFamily: UI, fontSize: 14, color: C.red, textDecoration: "underline" }}>Alle artikler →</Link>
              </div>
            </section>
          )}
        </main>

        <footer style={{ marginTop: "auto", borderTop: `2px solid ${C.ink}`, padding: `22px ${PAD}`, fontFamily: UI, fontSize: 12.5, color: C.dek, lineHeight: 1.6 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>Lottoresultater</div>
          <div style={{ marginTop: 6 }}>Utgitt av <Link href="/om-oss" style={{ color: C.red }}>Desken AS</Link> (org.nr 984 358 202 MVA). Uavhengig tjeneste — ikke tilknyttet Norsk Tipping. Resultater gjengis som opplysning; sjekk alltid mot din offisielle kupong.</div>
          <div style={{ marginTop: 6, color: C.meta }}>Spilleavhengighet? Ring Hjelpelinjen 800 800 40. Du må være 18 år for å spille.</div>
        </footer>
      </div>
    </div>
  );
}
