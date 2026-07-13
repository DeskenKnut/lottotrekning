import type { Draw } from "./getDraws";

export type Spill = "lotto" | "vikinglotto" | "eurojackpot" | "joker";

export const GAMES: Record<Spill, {
  value: string; label: string; min: number; max: number; digits: boolean; mainCount: number; day: string;
}> = {
  lotto:       { value: "LOTTO",       label: "Lotto",       min: 1, max: 34, digits: false, mainCount: 7, day: "lørdag" },
  vikinglotto: { value: "VIKINGLOTTO", label: "Vikinglotto", min: 1, max: 48, digits: false, mainCount: 6, day: "onsdag" },
  eurojackpot: { value: "EUROJACKPOT", label: "Eurojackpot", min: 1, max: 50, digits: false, mainCount: 5, day: "tirsdag og fredag" },
  joker:       { value: "JOKER",       label: "Joker",       min: 0, max: 9,  digits: true,  mainCount: 5, day: "onsdag og lørdag" },
};

export function isSpill(s: string): s is Spill {
  return s === "lotto" || s === "vikinglotto" || s === "eurojackpot" || s === "joker";
}

export type Stats = {
  count: number;
  first?: string; last?: string;
  freq: { n: number; times: number }[];      // sortert etter tall stigende
  ranked: { n: number; times: number }[];    // sortert etter hyppighet synkende
  avgPerNumber: number;
  topPrizeAvg: number | null;
  topPrizeMax: number | null;
  drawsWithPrize: number;
};

export function computeStats(draws: Draw[], g: (typeof GAMES)[Spill]): Stats {
  const freqMap = new Map<number, number>();
  for (let n = g.min; n <= g.max; n++) freqMap.set(n, 0);
  const tops: number[] = [];
  for (const d of draws) {
    const p = d.payload || {};
    for (const n of (p.mainNumbers || [])) freqMap.set(n, (freqMap.get(n) ?? 0) + 1);
    const tiers = p.prizeTiers || [];
    if (tiers.length) tops.push(Math.max(...tiers.map((t: any) => t.amount || 0)));
  }
  const freq = [...freqMap.entries()].map(([n, times]) => ({ n, times })).sort((a, b) => a.n - b.n);
  const ranked = [...freq].sort((a, b) => b.times - a.times || a.n - b.n);
  const totalPicks = freq.reduce((s, x) => s + x.times, 0);
  const dates = draws.map((d) => d.draw_date).sort();
  return {
    count: draws.length,
    first: dates[0], last: dates[dates.length - 1],
    freq, ranked,
    avgPerNumber: freq.length ? totalPicks / freq.length : 0,
    topPrizeAvg: tops.length ? Math.round(tops.reduce((a, b) => a + b, 0) / tops.length) : null,
    topPrizeMax: tops.length ? Math.max(...tops) : null,
    drawsWithPrize: tops.length,
  };
}

export function statsForNumber(stats: Stats, n: number) {
  const rankIdx = stats.ranked.findIndex((x) => x.n === n);
  const entry = stats.ranked[rankIdx];
  const times = entry ? entry.times : 0;
  const pctVsAvg = stats.avgPerNumber ? (times / stats.avgPerNumber - 1) * 100 : 0;
  return { times, rank: rankIdx + 1, of: stats.ranked.length, pctVsAvg };
}

export const kr = (v: number) => v.toLocaleString("no-NO").replace(/,/g, " ") + " kr";
