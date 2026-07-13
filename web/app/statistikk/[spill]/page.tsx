import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllDraws } from "../../../lib/getDraws";
import { GAMES, isSpill, computeStats, kr } from "../../../lib/stats";

export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(GAMES).map((spill) => ({ spill }));
}

const C = {
  ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6",
  dek: "#4a4038", meta: "#9a9186", red: "#a3211f", gold: "#c9a34a", adbg: "#f4f2ec",
};

export async function generateMetadata({ params }: { params: Promise<{ spill: string }> }) {
  const { spill } = await params;
  if (!isSpill(spill)) return {};
  const g = GAMES[spill];
  return {
    title: `${g.label}-statistikk: mest og minst trukne tall (2015–i dag)`,
    description: `Hvilke tall trekkes oftest i ${g.label}? Komplett frekvensstatistikk og premietall fra over ti år med trekninger.`,
  };
}

export default async function Pillar({ params }: { params: Promise<{ spill: string }> }) {
  const { spill } = await params;
  if (!isSpill(spill)) notFound();
  const g = GAMES[spill];
  const draws = await getAllDraws(g.value);
  const s = computeStats(draws, g);

  const thin = s.count < 20;
  const most = s.ranked.slice(0, 5);
  const least = s.ranked.slice(-5).reverse();
  const yearFrom = s.first?.slice(0, 4);
  const yearTo = s.last?.slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${g.label}-statistikk ${yearFrom}–${yearTo}`,
    description: `Frekvens for hvert tall og premietall i ${g.label}, basert på ${s.count} trekninger.`,
    creator: { "@type": "Organization", name: "Desken AS" },
    temporalCoverage: `${s.first}/${s.last}`,
  };

  return (
    <div style={{ background: C.page, minHeight: "100vh", color: C.ink }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 820, margin: "0 auto", background: C.card, padding: "0 20px 40px" }}>
        <nav style={{ padding: "14px 0", borderBottom: `1px solid ${C.rule}`, fontFamily: "var(--font-ui)", fontSize: 14 }}>
          <Link href="/" style={{ color: C.red, textDecoration: "none" }}>Forside</Link>
          <span style={{ color: C.meta }}> · Statistikk · {g.label}</span>
        </nav>

        {thin ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, marginTop: 30 }}>
            Vi bygger statistikk for {g.label} etter hvert som trekningene samler seg. Kom tilbake snart.
          </p>
        ) : (
          <>
            <header style={{ padding: "26px 0 10px" }}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, letterSpacing: 1, color: C.meta, textTransform: "uppercase" }}>
                Statistikk · {yearFrom}–{yearTo}
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, margin: "8px 0 0" }}>
                Hvilke tall trekkes oftest i {g.label}?
              </h1>
            </header>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.55, color: C.ink }}>
              {g.digits ? (
                <>Siden {yearFrom} har sifferet <strong>{most[0].n}</strong> kommet flest ganger i {g.label} — {most[0].times} ganger av {s.count} trekninger.</>
              ) : (
                <>Siden {yearFrom} er tallet <strong>{most[0].n}</strong> trukket flest ganger i {g.label} — <strong>{most[0].times} ganger</strong> av {s.count} trekninger. Det sjeldneste er <strong>{least[0].n}</strong>, med {least[0].times}.</>
              )}
            </p>

            {s.topPrizeAvg && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: C.dek }}>
                Toppremien i {g.label} har i snitt vært <strong>{kr(s.topPrizeAvg)}</strong> i perioden, med en høyeste enkelttrekning på {kr(s.topPrizeMax!)}. <span style={{ color: C.meta }}>(Premieprognoser fra Norsk Tipping.)</span>
              </p>
            )}

            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", margin: "22px 0" }}>
              <div style={{ flex: "1 1 240px" }}>
                <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.meta, borderBottom: `2px solid ${C.ink}`, paddingBottom: 6 }}>Mest trukket</h2>
                {most.map((x) => (
                  <Row key={x.n} spill={spill} n={x.n} times={x.times} digits={g.digits} />
                ))}
              </div>
              <div style={{ flex: "1 1 240px" }}>
                <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.meta, borderBottom: `2px solid ${C.ink}`, paddingBottom: 6 }}>Sjeldnest trukket</h2>
                {least.map((x) => (
                  <Row key={x.n} spill={spill} n={x.n} times={x.times} digits={g.digits} />
                ))}
              </div>
            </div>

            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, marginTop: 30 }}>
              Betyr dette at du bør spille {g.digits ? "disse sifrene" : `tallet ${most[0].n}`}?
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.6, color: C.dek }}>
              Nei. Hver {g.label}-trekning er en helt uavhengig, tilfeldig hendelse — {g.digits ? "sifrene" : "kulene"} har ingen hukommelse. At {most[0].n} er trukket ofte før, gjør det verken mer eller mindre sannsynlig neste gang. Alle {g.digits ? "sifre" : `${g.max} tall`} har nøyaktig samme sjanse i hver trekning. Forskjellene over er tilfeldig variasjon over {yearFrom}–{yearTo}, ikke et mønster du kan utnytte.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.6, color: C.dek }}>
              Det statistikken faktisk kan brukes til er å velge kombinasjoner få andre spiller. Det endrer ikke sjansen din for å vinne — men vinner du, deler færre premien, så forventet utbetaling går opp.
            </p>

            <h3 style={{ fontFamily: "var(--font-ui)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.meta, borderBottom: `2px solid ${C.ink}`, paddingBottom: 6, marginTop: 30 }}>Alle tall</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {s.freq.map((x) => (
                <Link key={x.n} href={`/statistikk/${spill}/tall/${x.n}`}
                  style={{ fontFamily: "var(--font-ui)", fontSize: 13, textDecoration: "none", color: C.ink, border: `1px solid ${C.rule}`, padding: "4px 8px", background: C.card }}>
                  {x.n} <span style={{ color: C.meta }}>· {x.times}</span>
                </Link>
              ))}
            </div>

            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: C.meta, marginTop: 30, borderTop: `1px solid ${C.rule}`, paddingTop: 12 }}>
              Kilde: Lottotrekning / Desken AS sitt eget trekningsarkiv, {s.count} {g.label}-trekninger {yearFrom}–{yearTo}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ spill, n, times, digits }: { spill: string; n: number; times: number; digits: boolean }) {
  return (
    <Link href={`/statistikk/${spill}/tall/${n}`}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ece8e0", textDecoration: "none", color: "#1a1512" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#1a1512", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13 }}>{n}</span>
      </span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "#4a4038" }}>{times} ganger</span>
    </Link>
  );
}
