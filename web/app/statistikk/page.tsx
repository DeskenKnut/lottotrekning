import Link from "next/link";
import { GAMES } from "../../lib/stats";

export const revalidate = 3600;

export const metadata = {
  title: "Lotto-statistikk: mest trukne tall og premietall — Lottoresultater",
  description: "Statistikk over hvilke tall som trekkes oftest i Lotto, Vikinglotto, Eurojackpot og Joker, basert på over ti år med trekninger.",
};

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f" };

export default function StatistikkHub() {
  return (
    <div style={{ background: C.page, minHeight: "100vh", color: C.ink }}>
      <div style={{ maxWidth: 820, margin: "0 auto", background: C.card, padding: "0 20px 40px" }}>
        <nav style={{ padding: "14px 0", borderBottom: `1px solid ${C.rule}`, fontFamily: "var(--font-ui)", fontSize: 14 }}>
          <Link href="/" style={{ color: C.red, textDecoration: "none" }}>Forside</Link>
          <span style={{ color: C.meta }}> · Statistikk</span>
        </nav>

        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px,5vw,42px)", margin: "26px 0 6px" }}>Statistikk</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.55, color: C.dek, marginTop: 0 }}>
          Hvilke tall trekkes oftest? Vi har gått gjennom over ti år med trekninger. Tallene under er historiske fakta — de sier ingenting om hva som kommer neste gang, for hver trekning er tilfeldig og uavhengig.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 24 }}>
          {Object.entries(GAMES).map(([spill, g]) => (
            <Link key={spill} href={`/statistikk/${spill}`}
              style={{ border: `1px solid ${C.rule}`, background: C.card, padding: 20, textDecoration: "none", color: C.ink }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>{g.label}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: C.red, marginTop: 8 }}>Se statistikk →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
