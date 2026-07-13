import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Extra resultater og trekning – Norsk Tipping | Lottoresultater",
  description:
    "Resultater og vinnertall fra Extra-trekningen. Extra er et av Norsk Tippings spill – her samler vi resultatene når trekningen er gjennomført.",
};

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f" };
const DISPLAY = "var(--font-display, Georgia, serif)";
const BODY = "var(--font-body, Georgia, serif)";
const UI = "var(--font-ui, system-ui, sans-serif)";
const PAD = "clamp(20px, 4vw, 40px)";

const NAV = [
  ["Lotto", "/lotto"], ["Vikinglotto", "/vikinglotto"], ["Eurojackpot", "/eurojackpot"],
  ["Joker", "/joker"], ["Lykketall", "/lykketall"], ["Extra", "/extra"], ["Statistikk", "/statistikk"], ["Artikler", "/artikler"],
];

export default function ExtraPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.page, minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "clamp(360px, 94vw, 960px)", background: C.card, minHeight: "100vh", display: "flex", flexDirection: "column", color: C.ink }}>
        <header style={{ borderBottom: `2px solid ${C.ink}`, padding: `18px ${PAD} 0` }}>
          <Link href="/" style={{ display: "block", textDecoration: "none", color: C.ink, textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(30px,6vw,52px)", letterSpacing: "-0.5px", lineHeight: 1 }}>Lottoresultater</div>
            <div style={{ fontFamily: UI, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.meta, margin: "8px 0 14px" }}>Norske lottoresultater og trekning</div>
          </Link>
          <nav style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${C.rule}`, padding: "10px 0" }}>
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} style={{ fontFamily: UI, fontSize: 13, letterSpacing: 0.3, textDecoration: "none", padding: "4px 11px", color: href === "/extra" ? C.red : C.ink, fontWeight: href === "/extra" ? 700 : 500 }}>{label}</Link>
            ))}
          </nav>
        </header>

        <main style={{ padding: `28px ${PAD}`, flex: 1 }}>
          <div style={{ fontFamily: UI, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: C.red, fontWeight: 700 }}>Extra · Norsk Tipping</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, lineHeight: 1.06, margin: "6px 0 12px" }}>Extra resultater</h1>

          <p style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: C.ink, maxWidth: 640 }}>
            Extra er et av spillene fra Norsk Tipping. Her samler vi resultatene og vinnertallene fra Extra-trekningen, oppdatert automatisk når trekningen er gjennomført.
          </p>
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: C.dek, maxWidth: 640, marginTop: 12 }}>
            Vi legger ut de nyeste Extra-resultatene her fortløpende. I mellomtiden finner du oppdaterte resultater for de andre spillene:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 18, maxWidth: 640 }}>
            {[["Lotto", "/lotto"], ["Vikinglotto", "/vikinglotto"], ["Eurojackpot", "/eurojackpot"], ["Joker", "/joker"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ border: `1px solid ${C.rule}`, background: C.card, padding: "14px 16px", textDecoration: "none", color: C.ink, borderRadius: 2 }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18 }}>{label}</div>
                <div style={{ fontFamily: UI, fontSize: 12, color: C.red, marginTop: 4 }}>Se resultater →</div>
              </Link>
            ))}
          </div>
        </main>

        <footer style={{ marginTop: "auto", borderTop: `2px solid ${C.ink}`, padding: `22px ${PAD}`, fontFamily: UI, fontSize: 12.5, color: C.dek, lineHeight: 1.6 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>Lottoresultater</div>
          <div style={{ marginTop: 6 }}>Utgitt av Desken AS (org.nr 984 358 202 MVA). Uavhengig tjeneste — ikke tilknyttet Norsk Tipping. Resultater gjengis som opplysning; sjekk alltid mot din offisielle kupong.</div>
          <div style={{ marginTop: 6, color: C.meta }}>Spilleavhengighet? Ring Hjelpelinjen 800 800 40. Du må være 18 år for å spille.</div>
        </footer>
      </div>
    </div>
  );
}
