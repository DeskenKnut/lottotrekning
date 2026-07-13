"use client";
import React, { useEffect, useRef, useState } from "react";

const C = {
  ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6",
  dek: "#4a4038", meta: "#9a9186", red: "#a3211f", gold: "#c9a34a",
};
const DISPLAY = "var(--font-display, Georgia, serif)";
const BODY = "var(--font-body, Georgia, serif)";
const UI = "var(--font-ui, system-ui, sans-serif)";

type GameCfg = {
  label: string;
  main?: { count: number; min: number; max: number };
  bonus?: { count: number; min: number; max: number; label: string; fromMainPool?: boolean };
  digits?: { count: number };
};

const GAMES: Record<string, GameCfg> = {
  lotto: { label: "Lotto", main: { count: 7, min: 1, max: 34 }, bonus: { count: 1, min: 1, max: 34, label: "Tilleggstall", fromMainPool: true } },
  vikinglotto: { label: "Vikinglotto", main: { count: 6, min: 1, max: 48 }, bonus: { count: 1, min: 1, max: 5, label: "Vikingtall" } },
  eurojackpot: { label: "Eurojackpot", main: { count: 5, min: 1, max: 50 }, bonus: { count: 2, min: 1, max: 12, label: "Stjernetall" } },
  joker: { label: "Joker", digits: { count: 5 } },
};
const ORDER = ["lotto", "vikinglotto", "eurojackpot", "joker"];

// Vekting for "unngå populære tall": færre velger tall over 31 (utenfor datoer),
// og 7 er overrepresentert. Dette endrer IKKE vinnersjansen — bare hvor mange du
// eventuelt deler premien med.
function weight(n: number, avoid: boolean) {
  if (!avoid) return 1;
  let w = 1;
  if (n > 31) w = 2.6;
  if (n === 7) w *= 0.5;
  return w;
}
function pick(min: number, max: number, count: number, avoid: boolean, unique: boolean, exclude: number[] = []) {
  const chosen: number[] = [];
  for (let k = 0; k < count; k++) {
    const pool: number[] = [];
    for (let n = min; n <= max; n++) {
      if (unique && (chosen.includes(n) || exclude.includes(n))) continue;
      pool.push(n);
    }
    const total = pool.reduce((s, n) => s + weight(n, avoid), 0);
    let r = Math.random() * total;
    let sel = pool[pool.length - 1];
    for (const n of pool) { r -= weight(n, avoid); if (r <= 0) { sel = n; break; } }
    chosen.push(sel);
  }
  return chosen;
}

type Result = { main: number[]; bonus: number[]; bonusLabel?: string; digits?: number[] };

function Ball({ value, revealed, bonus }: { value: number; revealed: boolean; bonus?: boolean }) {
  const size = bonus ? 42 : 48;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: UI, fontWeight: 700, fontSize: bonus ? 16 : 19,
      background: bonus ? C.gold : C.ink, color: bonus ? C.ink : "#fdfcfa",
      border: `1px solid ${bonus ? C.gold : C.ink}`, boxShadow: "0 2px 5px rgba(26,21,18,0.18)",
      opacity: revealed ? 1 : 0,
      animation: revealed ? "ballRoll 0.7s cubic-bezier(0.34,1.4,0.64,1)" : "none",
      transform: revealed ? "none" : "translateY(-60px) scale(0.5)",
    }}>{revealed ? value : ""}</div>
  );
}

export default function LykketallGenerator() {
  const [spill, setSpill] = useState("lotto");
  const [avoid, setAvoid] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [revealed, setRevealed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function generer() {
    const g = GAMES[spill];
    let result: Result;
    if (g.digits) {
      result = { main: [], bonus: [], digits: pick(0, 9, g.digits.count, false, false) };
    } else {
      const main = pick(g.main!.min, g.main!.max, g.main!.count, avoid, true).sort((a, b) => a - b);
      let bonus: number[] = [];
      if (g.bonus) {
        bonus = pick(g.bonus.min, g.bonus.max, g.bonus.count, avoid, true, g.bonus.fromMainPool ? main : []).sort((a, b) => a - b);
      }
      result = { main, bonus, bonusLabel: g.bonus?.label };
    }
    setRes(result);
    const total = (result.digits?.length || 0) + result.main.length + result.bonus.length;
    setRevealed(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setRevealed((r) => { if (r >= total) { if (timer.current) clearInterval(timer.current); return r; } return r + 1; });
    }, 140);
  }

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const btn = (active: boolean): React.CSSProperties => ({
    fontFamily: UI, fontSize: 14, padding: "8px 16px", cursor: "pointer",
    border: `1px solid ${active ? C.ink : C.rule}`, background: active ? C.ink : "transparent",
    color: active ? "#fdfcfa" : C.ink, borderRadius: 2, fontWeight: active ? 700 : 500,
  });

  const g = GAMES[spill];
  const mainOffset = res?.digits ? 0 : 0;

  return (
    <div>
      <style>{`@keyframes ballRoll {
        0% { transform: translateY(-60px) rotate(-260deg) scale(0.5); opacity: 0; }
        65% { transform: translateY(7px) rotate(30deg) scale(1.08); opacity: 1; }
        85% { transform: translateY(-3px) rotate(-8deg) scale(0.98); }
        100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } }`}</style>

      {/* Spillvelger */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {ORDER.map((k) => (
          <button key={k} onClick={() => { setSpill(k); setRes(null); }} style={btn(spill === k)}>{GAMES[k].label}</button>
        ))}
      </div>

      {/* Unngå populære tall */}
      {!g.digits && (
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: UI, fontSize: 14, color: C.dek, marginBottom: 16, cursor: "pointer" }}>
          <input type="checkbox" checked={avoid} onChange={(e) => setAvoid(e.target.checked)} />
          Unngå populære tall (færre å dele premien med hvis du vinner)
        </label>
      )}

      <button onClick={generer} style={{ fontFamily: UI, fontSize: 16, fontWeight: 700, padding: "12px 28px", cursor: "pointer", background: C.red, color: "#fff", border: "none", borderRadius: 2 }}>
        {res ? "Trekk nye tall" : "Trekk lykketall"}
      </button>

      {/* Resultat */}
      {res && (
        <div style={{ marginTop: 26 }}>
          {res.digits ? (
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {res.digits.map((v, i) => <Ball key={i} value={v} revealed={i < revealed} />)}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {res.main.map((v, i) => <Ball key={i} value={v} revealed={i < revealed} />)}
              </div>
              {res.bonus.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.dek, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{res.bonusLabel}</div>
                  <div style={{ display: "flex", gap: 9 }}>
                    {res.bonus.map((v, i) => <Ball key={i} value={v} bonus revealed={res.main.length + i < revealed} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
