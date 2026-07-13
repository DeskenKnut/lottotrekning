import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllDraws } from "../../../../../lib/getDraws";
import { GAMES, isSpill, computeStats, statsForNumber, kr } from "../../../../../lib/stats";

export const revalidate = 3600;

export function generateStaticParams() {
  const out: { spill: string; n: string }[] = [];
  for (const [spill, g] of Object.entries(GAMES)) {
    for (let n = g.min; n <= g.max; n++) out.push({ spill, n: String(n) });
  }
  return out;
}

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f" };

export async function generateMetadata({ params }: { params: Promise<{ spill: string; n: string }> }) {
  const { spill, n } = await params;
  if (!isSpill(spill)) return {};
  const g = GAMES[spill];
  const kind = g.digits ? "Sifferet" : "Tallet";
  return {
    title: `${kind} ${n} i ${g.label}: hvor ofte er det trukket?`,
    description: `Hvor mange ganger er ${g.digits ? "sifferet" : "tallet"} ${n} trukket i ${g.label}? Se frekvens, plassering og sist trukket — fra hele arkivet.`,
  };
}

export default async function NumberPage({ params }: { params: Promise<{ spill: string; n: string }> }) {
  const { spill, n: nStr } = await params;
  if (!isSpill(spill)) notFound();
  const g = GAMES[spill];
  const n = parseInt(nStr, 10);
  if (isNaN(n) || n < g.min || n > g.max) notFound();

  const draws = await getAllDraws(g.value);
  const s = computeStats(draws, g);
  const info = statsForNumber(s, n);

  // sist trukket
  let last: string | undefined;
  for (let i = draws.length - 1; i >= 0; i--) {
    if ((draws[i].payload?.mainNumbers || []).includes(n)) { last = draws[i].draw_date; break; }
  }
  const yearFrom = s.first?.slice(0, 4), yearTo = s.last?.slice(0, 4);
  const kind = g.digits ? "Sifferet" : "Tallet";
  const kindLow = g.digits ? "sifferet" : "tallet";
  const pct = Math.round(info.pctVsAvg);
  const vs = pct === 0 ? "nøyaktig på snittet" : pct > 0 ? `${pct} % over snittet` : `${Math.abs(pct)} % under snittet`;

  const faq = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Hvor mange ganger er ${kindLow} ${n} trukket i ${g.label}?`,
        acceptedAnswer: { "@type": "Answer", text: `${kind} ${n} er trukket ${info.times} ganger i ${g.label} i perioden ${yearFrom}–${yearTo}.` } },
      { "@type": "Question", name: `Øker det vinnersjansen å spille ${kindLow} ${n}?`,
        acceptedAnswer: { "@type": "Answer", text: "Nei. Hver trekning er uavhengig og tilfeldig; alle utfall har lik sjanse hver gang." } },
    ],
  };

  return (
    <div style={{ background: C.page, minHeight: "100vh", color: C.ink }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", background: C.card, padding: "0 20px 40px" }}>
        <nav style={{ padding: "14px 0", borderBottom: `1px solid ${C.rule}`, fontFamily: "var(--font-ui)", fontSize: 14 }}>
          <Link href="/" style={{ color: C.red, textDecoration: "none" }}>Forside</Link>
          <span style={{ color: C.meta }}> · </span>
          <Link href={`/statistikk/${spill}`} style={{ color: C.red, textDecoration: "none" }}>{g.label}-statistikk</Link>
          <span style={{ color: C.meta }}> · {kindLow} {n}</span>
        </nav>

        <header style={{ padding: "26px 0 6px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 60, height: 60, borderRadius: "50%", background: C.ink, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 26 }}>{n}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(24px,4.5vw,34px)", lineHeight: 1.1, margin: 0 }}>
            {kind} {n} i {g.label}
          </h1>
        </header>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.55 }}>
          {kind} {n} er trukket <strong>{info.times} ganger</strong> i {g.label} i perioden {yearFrom}–{yearTo} — det er {vs}. {info.times > 0 && `Det gjør ${n} til det ${info.rank}. mest trukne av ${info.of}.`} {last && `Sist trukket ${new Date(last).toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" })}.`}
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "20px 0", fontFamily: "var(--font-ui)" }}>
          <Stat label="Antall ganger" value={String(info.times)} />
          <Stat label="Plassering" value={`#${info.rank} av ${info.of}`} />
          <Stat label="Mot snittet" value={`${pct >= 0 ? "+" : ""}${pct} %`} />
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: C.dek }}>
          <strong>Hjelper dette deg å vinne?</strong> Nei. At {n} har blitt trukket {info.times} ganger sier ingenting om neste trekning — {g.label} er ren tilfeldighet, og {kindLow} {n} har akkurat samme sjanse som alle andre hver gang. Tallet over er et historisk faktum, ikke et spilltips.
        </p>

        <div style={{ marginTop: 24 }}>
          <Link href={`/statistikk/${spill}`} style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: C.red, textDecoration: "underline" }}>
            ← Se full {g.label}-statistikk
          </Link>
        </div>

        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: C.meta, marginTop: 30, borderTop: `1px solid ${C.rule}`, paddingTop: 12 }}>
          Kilde: Lottoresultater / Desken AS sitt trekningsarkiv, {s.count} trekninger {yearFrom}–{yearTo}.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #c9c2b6", padding: "12px 16px", minWidth: 110 }}>
      <div style={{ fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", color: "#9a9186" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}
