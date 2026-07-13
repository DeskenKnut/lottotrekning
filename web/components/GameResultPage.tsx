"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Resultatside-komponent — avis-stil, drevet av datakontrakten fra
 * innhentingspipelinen (site_contract.to_site_payload). Samme komponent
 * driver alle spill via `payload`-prop. Ball-reveal, premie-opptelling og
 * nedtelling er beholdt uendret. Per-spill H1 + introtekst bærer søkeordene.
 */

type PrizeTier = { label: string; amount: number | null; jackpot: boolean };
type Payload = {
  game: string;
  drawDateLabel: string;
  drawDateIso: string | null;
  mainNumbers: number[];
  bonusNumbers: number[];
  bonusLabel: string | null;
  prizeTiers: PrizeTier[];
  countOrder: number[];
  nextDraw: { weekday: number; hour: number };
  turnoverKr?: number | null;
  source?: string;
};

// Avis-palett (samme som forside, statistikk og artikler)
const C = {
  ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6",
  dek: "#4a4038", meta: "#9a9186", red: "#a3211f", gold: "#c9a34a",
};
const DISPLAY = "var(--font-display, Georgia, 'Times New Roman', serif)";
const BODY = "var(--font-body, Georgia, serif)";
const UI = "var(--font-ui, system-ui, sans-serif)";
const PAD = "clamp(20px, 4vw, 40px)";

const fmtKr = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const NAV = [
  { key: "LOTTO", label: "Lotto", href: "/lotto" },
  { key: "VIKINGLOTTO", label: "Vikinglotto", href: "/vikinglotto" },
  { key: "EUROJACKPOT", label: "Eurojackpot", href: "/eurojackpot" },
  { key: "JOKER", label: "Joker", href: "/joker" },
  { key: "LYKKETALL", label: "Lykketall", href: "/lykketall" },
  { key: "STATISTIKK", label: "Statistikk", href: "/statistikk" },
  { key: "ARTIKLER", label: "Artikler", href: "/artikler" },
];
const TITLE: Record<string, string> = {
  LOTTO: "Lotto", VIKINGLOTTO: "Vikinglotto",
  EUROJACKPOT: "Eurojackpot", JOKER: "Joker",
};
const SPILL_SLUG: Record<string, string> = {
  LOTTO: "lotto", VIKINGLOTTO: "vikinglotto",
  EUROJACKPOT: "eurojackpot", JOKER: "joker",
};
// Søkeord-bevisst overskrift + introtekst per spill (naturlig, ikke spammy).
const GAME_SEO: Record<string, { h1: string; intro: string }> = {
  LOTTO: {
    h1: "Lottoresultater",
    intro: "Her finner du de siste lottoresultatene fra Norsk Tipping. Vinnertallene og premiene under er fra den ferskeste lottotrekningen, og oppdateres automatisk etter hver trekning lørdag.",
  },
  VIKINGLOTTO: {
    h1: "Vikinglotto resultater",
    intro: "De siste Vikinglotto-resultatene med vinnertall og vikingtall. Tallene er fra onsdagens vikinglotto-trekning og oppdateres automatisk etter hver trekning.",
  },
  EUROJACKPOT: {
    h1: "Eurojackpot resultater",
    intro: "De siste Eurojackpot-resultatene med vinnertall og stjernetall fra fredagens trekning. Tallene oppdateres automatisk etter hver trekning.",
  },
  JOKER: {
    h1: "Joker resultater",
    intro: "De siste Joker-resultatene og vinnertallene. Joker trekkes både onsdag og lørdag, og resultatene fra hver jokertrekning oppdateres automatisk.",
  },
};
const WD_ADJ = ["Mandagens", "Tirsdagens", "Onsdagens", "Torsdagens", "Fredagens", "Lørdagens", "Søndagens"];

function Ball({ value, revealed, bonus }: { value: number; revealed: boolean; bonus?: boolean }) {
  const size = bonus ? 42 : 48;
  const anim = revealed && !reduced();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700,
      fontSize: bonus ? 16 : 19, background: bonus ? C.gold : C.ink,
      color: bonus ? C.ink : "#fdfcfa", boxShadow: "0 2px 5px rgba(26,21,18,0.18)",
      border: bonus ? `1px solid ${C.gold}` : `1px solid ${C.ink}`,
      opacity: revealed ? 1 : 0,
      animation: anim ? "ballRoll 1s cubic-bezier(0.34,1.4,0.64,1)" : "none",
      transform: revealed ? "none" : "translateY(-70px) scale(0.5)",
    }}>{revealed ? value : ""}</div>
  );
}

// Ekte AdSense-annonse (responsiv). Styres av samme bryter som resten:
// vises kun når NEXT_PUBLIC_ADS_ENABLED = "true". Ellers vises ingenting
// (ingen plassholder-bokser til besøkende).
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
const AD_CLIENT = "ca-pub-7026592530077937";
const AD_SLOT = "5524910523";

function AdSlot({ size }: { size?: string }) {
  useEffect(() => {
    if (!ADS_ENABLED) return;
    try {
      // @ts-expect-error adsbygoogle legges på window av AdSense-skriptet i layout.tsx
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!ADS_ENABLED) return null;

  return (
    <div style={{ margin: "26px auto", textAlign: "center", maxWidth: 728 }} aria-label="Annonse">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Trekningsplan per spill (JS getDay: 0=søn,1=man,2=tir,3=ons,4=tor,5=fre,6=lør).
// Joker og Eurojackpot trekkes to ganger i uken — nedtellingen velger den nærmeste.
const DRAW_SCHEDULE: Record<string, { day: number; hour: number }[]> = {
  LOTTO: [{ day: 6, hour: 20 }],
  VIKINGLOTTO: [{ day: 3, hour: 21 }],
  JOKER: [{ day: 3, hour: 21 }, { day: 6, hour: 20 }],
  EUROJACKPOT: [{ day: 2, hour: 21 }, { day: 5, hour: 21 }],
};

export default function GameResultPage({ payload }: { payload: Payload }) {
  const totalBalls = payload.mainNumbers.length + payload.bonusNumbers.length;
  const isReduced = reduced();

  const [revealed, setRevealed] = useState(isReduced ? totalBalls : 0);
  useEffect(() => {
    if (isReduced) return;
    const id = setInterval(() => {
      setRevealed((r) => { if (r >= totalBalls) { clearInterval(id); return r; } return r + 1; });
    }, 800);
    return () => clearInterval(id);
  }, [totalBalls, isReduced]);
  const ballsDone = revealed >= totalBalls;

  const [elapsed, setElapsed] = useState(isReduced ? 999999 : 0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ballsDone || isReduced) return;
    let raf: number;
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      setElapsed(t - startRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ballsDone, isReduced]);

  const tierValue = (i: number) => {
    const tier = payload.prizeTiers[i];
    if (tier.jackpot || tier.amount == null) return "JACKPOT";
    const rank = payload.countOrder.indexOf(i);
    const start = rank * 1200;
    const p = Math.max(0, Math.min(1, (elapsed - start) / 900));
    const eased = 1 - Math.pow(1 - p, 3);
    return fmtKr(Math.round(tier.amount * eased));
  };

  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const countdown = useMemo(() => {
    const d = new Date(now);
    // Bruk spillets faste trekningsplan; fall tilbake til payload.nextDraw for ukjente spill.
    let schedule = DRAW_SCHEDULE[payload.game];
    if (!schedule) {
      const { weekday, hour } = payload.nextDraw;
      schedule = [{ day: (weekday + 1) % 7, hour }];
    }
    // Finn den nærmeste kommende trekningen blant alle trekningsdager.
    let best: Date | null = null;
    for (const { day, hour } of schedule) {
      const t = new Date(d);
      const add = (day - d.getDay() + 7) % 7;
      t.setDate(d.getDate() + add);
      t.setHours(hour, 0, 0, 0);
      if (t <= d) t.setDate(t.getDate() + 7);
      if (!best || t < best) best = t;
    }
    let s = Math.floor((+best! - +d) / 1000);
    const days = Math.floor(s / 86400); s -= days * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); const sec = s - m * 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return days >= 1 ? `${days}d ${pad(h)}t ${pad(m)}m` : `${pad(h)}t ${pad(m)}m ${pad(sec)}s`;
  }, [now, payload.nextDraw, payload.game]);

  const weekdayAdj = payload.drawDateIso
    ? WD_ADJ[new Date(payload.drawDateIso).getDay() === 0 ? 6 : new Date(payload.drawDateIso).getDay() - 1]
    : "Siste";
  const gameName = TITLE[payload.game] ?? payload.game;
  const slug = SPILL_SLUG[payload.game];
  const seo = GAME_SEO[payload.game] ?? { h1: `${gameName} resultater`, intro: "" };
  const card = { background: C.card, border: `1px solid ${C.rule}`, borderRadius: 2, padding: 22 };

  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.page, minHeight: "100vh" }}>
      <style>{`@keyframes ballRoll {
        0% { transform: translateY(-70px) rotate(-260deg) scale(0.5); opacity: 0; }
        65% { transform: translateY(8px) rotate(30deg) scale(1.08); opacity: 1; }
        85% { transform: translateY(-4px) rotate(-8deg) scale(0.98); }
        100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } }`}</style>

      <div style={{ width: "100%", maxWidth: "clamp(360px, 94vw, 960px)", background: C.card, minHeight: "100vh", display: "flex", flexDirection: "column", color: C.ink }}>
        {/* Masthead */}
        <header style={{ borderBottom: `2px solid ${C.ink}`, padding: `18px ${PAD} 0` }}>
          <a href="/" style={{ display: "block", textDecoration: "none", color: C.ink, textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(30px,6vw,52px)", letterSpacing: "-0.5px", lineHeight: 1 }}>Lottoresultater</div>
            <div style={{ fontFamily: UI, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.meta, margin: "8px 0 14px" }}>Norske lottoresultater og trekning</div>
          </a>
          <nav style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${C.rule}`, padding: "10px 0" }}>
            {NAV.map((n) => {
              const active = n.key === payload.game;
              return (
                <a key={n.key} href={n.href} style={{
                  fontFamily: UI, fontSize: 13, letterSpacing: 0.3, textDecoration: "none",
                  padding: "4px 11px", color: active ? C.red : C.ink, fontWeight: active ? 700 : 500,
                }}>{n.label}</a>
              );
            })}
          </nav>
        </header>

        <main style={{ padding: `28px ${PAD}`, flex: 1 }}>
          {/* Kicker + søkeord-H1 + intro */}
          <div style={{ fontFamily: UI, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: C.red, fontWeight: 700 }}>
            {gameName} · Siste trekning {payload.drawDateLabel}
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, lineHeight: 1.06, margin: "6px 0 10px" }}>
            {seo.h1}
          </h1>
          {seo.intro && (
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: C.dek, margin: "0 0 8px", maxWidth: 640 }}>
              {seo.intro}
            </p>
          )}

          <AdSlot size="320×100" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, marginTop: 8 }}>
            {/* Tall */}
            <section>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, margin: "0 0 14px" }}>{weekdayAdj} vinnertall</h2>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {payload.mainNumbers.map((v, i) => <Ball key={i} value={v} revealed={i < revealed} />)}
              </div>
              {payload.bonusNumbers.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.dek, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{payload.bonusLabel}</div>
                  <div style={{ display: "flex", gap: 9 }}>
                    {payload.bonusNumbers.map((v, i) => <Ball key={i} value={v} bonus revealed={payload.mainNumbers.length + i < revealed} />)}
                  </div>
                </div>
              )}
              {slug && (
                <p style={{ fontFamily: BODY, fontSize: 15, color: C.dek, marginTop: 20, lineHeight: 1.5 }}>
                  Se hvilke tall som er trukket oftest i <a href={`/statistikk/${slug}`} style={{ color: C.red }}>{gameName}-statistikken</a> — historiske fakta fra over ti år med trekninger.
                </p>
              )}
            </section>

            {/* Premier + Nedtelling */}
            <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={card}>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, margin: 0 }}>Premier</h2>
                <p style={{ fontFamily: UI, fontSize: 12, color: C.meta, margin: "4px 0 12px" }}>Premieprognose fra trekningen.</p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {payload.prizeTiers.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 2px", borderBottom: i < payload.prizeTiers.length - 1 ? `1px solid ${C.rule}` : "none" }}>
                      <span style={{ fontFamily: UI, fontSize: 14, fontWeight: 600, color: C.ink }}>{t.label}</span>
                      <span style={{ fontFamily: UI, fontSize: 16, fontWeight: 800, color: C.red, fontVariantNumeric: "tabular-nums" }}>{tierValue(i)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={card}>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Neste trekning</h2>
                <div style={{ fontFamily: UI, fontSize: 30, fontWeight: 800, color: C.red, fontVariantNumeric: "tabular-nums" }}>{countdown}</div>
              </div>
            </section>
          </div>

          <AdSlot size="320×100" />

          {/* Slik sjekker du */}
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(22px,3vw,28px)", fontWeight: 700, margin: "10px 0 16px" }}>Slik sjekker du tallene dine</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              ["Finn kupongen din", "Ha rekkene dine klare, enten på papir eller i spill-appen."],
              ["Sammenlign tallene", "Se hvor mange av tallene dine som stemmer med vinnertallene over."],
              ["Finn premieklassen", "Bruk premieoversikten over for å se hva antall rette gir i gevinst."],
            ].map(([title, body], i) => (
              <div key={i} style={card}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.ink, color: "#fdfcfa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{i + 1}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{title}</div>
                <div style={{ fontFamily: BODY, fontSize: 14, color: C.dek, lineHeight: 1.5 }}>{body}</div>
              </div>
            ))}
          </div>

          <AdSlot size="300×250" />
        </main>

        {/* Footer / kolofon */}
        <footer style={{ marginTop: "auto", borderTop: `2px solid ${C.ink}`, padding: `22px ${PAD}`, fontFamily: UI, fontSize: 12.5, color: C.dek, lineHeight: 1.6 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>Lottoresultater</div>
          <div style={{ marginTop: 6 }}>Utgitt av Desken AS (org.nr 984 358 202 MVA). Uavhengig tjeneste — ikke tilknyttet Norsk Tipping. Resultater gjengis som opplysning; sjekk alltid mot din offisielle kupong.</div>
          <div style={{ marginTop: 6, color: C.meta }}>Spilleavhengighet? Ring Hjelpelinjen 800 800 40. Du må være 18 år for å spille.</div>
        </footer>
      </div>
    </div>
  );
}
