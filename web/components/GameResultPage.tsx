"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Resultatside-komponent — produksjonsgjenskaping av design-handoff-en,
 * drevet av datakontrakten fra innhentingspipelinen (site_contract.to_site_payload).
 * Samme komponent driver alle spill via `payload`-prop.
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

const C = {
  gutter: "oklch(92% 0.015 90)", surface: "oklch(97% 0.015 90)",
  ink: "oklch(20% 0.02 150)", ink2: "oklch(45% 0.02 150)", foot: "oklch(50% 0.02 150)",
  green: "oklch(35% 0.09 150)", red: "oklch(50% 0.18 25)",
  gold: "oklch(80% 0.14 85)", goldInk: "oklch(25% 0.05 90)",
  cardBorder: "oklch(88% 0.02 90)", hair: "oklch(92% 0.015 90)", hair2: "oklch(85% 0.02 90)",
  pillInactive: "oklch(94% 0.015 90)", pillInactiveInk: "oklch(30% 0.02 150)",
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, sans-serif";
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
];
const TITLE: Record<string, string> = {
  LOTTO: "Lottotrekning", VIKINGLOTTO: "Vikinglotto-trekning",
  EUROJACKPOT: "Eurojackpot-trekning", JOKER: "Joker-trekning",
};
const WD_ADJ = ["Mandagens", "Tirsdagens", "Onsdagens", "Torsdagens", "Fredagens", "Lørdagens", "Søndagens"];

function Ball({ value, revealed, bonus }: { value: number; revealed: boolean; bonus?: boolean }) {
  const size = bonus ? 36 : 42;
  const anim = revealed && !reduced();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700,
      fontSize: bonus ? 14 : 16, background: bonus ? C.gold : C.green,
      color: bonus ? C.goldInk : "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
      opacity: revealed ? 1 : 0,
      animation: anim ? "ballRoll 1s cubic-bezier(0.34,1.4,0.64,1)" : "none",
      transform: revealed ? "none" : "translateY(-70px) scale(0.5)",
    }}>{revealed ? value : ""}</div>
  );
}

function AdSlot({ size }: { size: string }) {
  return (
    <div style={{
      maxWidth: 468, margin: "24px auto", border: "1px dashed oklch(75% 0.02 90)",
      borderRadius: 8, padding: "18px 12px", textAlign: "center",
      background: "repeating-linear-gradient(45deg, oklch(94% 0.01 90) 0 10px, oklch(97% 0.015 90) 10px 20px)",
    }}>
      <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "oklch(55% 0.02 150)" }}>Annonse</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "oklch(55% 0.02 150)", marginTop: 4 }}>Google-annonse · {size}</div>
    </div>
  );
}

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
    const { weekday, hour } = payload.nextDraw;
    const d = new Date(now);
    const target = new Date(d);
    const jsTarget = (weekday + 1) % 7;
    const add = (jsTarget - d.getDay() + 7) % 7;
    target.setDate(d.getDate() + add);
    target.setHours(hour, 0, 0, 0);
    if (target <= d) target.setDate(target.getDate() + 7);
    let s = Math.floor((+target - +d) / 1000);
    const days = Math.floor(s / 86400); s -= days * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); const sec = s - m * 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return days >= 1 ? `${days}d ${pad(h)}t ${pad(m)}m` : `${pad(h)}t ${pad(m)}m ${pad(sec)}s`;
  }, [now, payload.nextDraw]);

  const weekdayAdj = payload.drawDateIso ? WD_ADJ[new Date(payload.drawDateIso).getDay() === 0 ? 6 : new Date(payload.drawDateIso).getDay() - 1] : "Siste";
  const card = { background: "#fff", border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 22 };

  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.gutter, minHeight: "100vh" }}>
      <style>{`@keyframes ballRoll {
        0% { transform: translateY(-70px) rotate(-260deg) scale(0.5); opacity: 0; }
        65% { transform: translateY(8px) rotate(30deg) scale(1.08); opacity: 1; }
        85% { transform: translateY(-4px) rotate(-8deg) scale(0.98); }
        100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } }`}</style>

      <div style={{ width: "100%", maxWidth: "clamp(360px, 94vw, 960px)", background: C.surface, minHeight: "100vh", boxShadow: "0 0 40px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", color: C.ink }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `16px ${PAD}`, borderBottom: `1px solid ${C.hair2}` }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: C.ink }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, fontFamily: SANS }}>7</span>
            <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.3px", fontFamily: SERIF }}>Lottoresultater</span>
          </a>
          <nav style={{ display: "flex", gap: 8, overflowX: "auto", whiteSpace: "nowrap" }}>
            {NAV.map((n) => {
              const active = n.key === payload.game;
              return (
                <a key={n.key} href={n.href} style={{ borderRadius: 20, padding: "6px 14px", fontSize: 13, textDecoration: "none", fontFamily: SANS, background: active ? C.green : C.pillInactive, color: active ? "#fff" : C.pillInactiveInk, fontWeight: active ? 700 : 600 }}>{n.label}</a>
              );
            })}
          </nav>
        </header>

        <main style={{ padding: `24px ${PAD}`, flex: 1 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(26px,3.4vw,34px)", fontWeight: 700, margin: "4px 0 8px" }}>{TITLE[payload.game] ?? payload.game}</h1>
          <AdSlot size="320×100" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 8 }}>
            <section>
              <div style={{ fontFamily: SANS, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: C.red, fontWeight: 700 }}>Siste trekning · {payload.drawDateLabel}</div>
              <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, margin: "6px 0 16px" }}>{weekdayAdj} vinnertall</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {payload.mainNumbers.map((v, i) => <Ball key={i} value={v} revealed={i < revealed} />)}
              </div>
              {payload.bonusNumbers.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink2, marginBottom: 8 }}>{payload.bonusLabel}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {payload.bonusNumbers.map((v, i) => <Ball key={i} value={v} bonus revealed={payload.mainNumbers.length + i < revealed} />)}
                  </div>
                </div>
              )}
            </section>

            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={card}>
                <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, margin: 0 }}>Premier</h3>
                <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink2, margin: "4px 0 12px" }}>Vinnere og premier fra trekningen.</p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {payload.prizeTiers.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 4px", borderBottom: i < payload.prizeTiers.length - 1 ? `1px solid ${C.hair}` : "none" }}>
                      <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.pillInactiveInk }}>{t.label}</span>
                      <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: C.red }}>{tierValue(i)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={card}>
                <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Nedtelling til trekning</h3>
                <div style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color: C.red, fontVariantNumeric: "tabular-nums" }}>{countdown}</div>
              </div>
            </section>
          </div>

          <AdSlot size="320×100" />

          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, margin: "8px 0 16px" }}>Slik sjekker du tallene dine</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              ["Finn kupongen din", "Ha rekkene dine klare, enten på papir eller i spill-appen."],
              ["Sammenlign tallene", "Se hvor mange av tallene dine som stemmer med vinnertallene over."],
              ["Finn premieklassen", "Bruk premieoversikten over for å se hva antall rette gir i gevinst."],
            ].map(([title, body], i) => (
              <div key={i} style={card}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{i + 1}</div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: C.ink2 }}>{body}</div>
              </div>
            ))}
          </div>

          <AdSlot size="300×250" />
        </main>

        <footer style={{ marginTop: "auto", borderTop: `1px solid ${C.hair2}`, padding: `20px ${PAD}`, fontFamily: SANS, fontSize: 12, color: C.foot }}>
          <div>© 2026 Lottoresultater — ikke offisiell spillside.</div>
          <div style={{ marginTop: 4 }}>Spilleavhengighet? Ring Hjelpelinjen 800 800 40</div>
        </footer>
      </div>
    </div>
  );
}
