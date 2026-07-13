"use client";
import { useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f", ok: "#1f6b4a" };
const UI = "var(--font-ui, system-ui, sans-serif)";
const DISPLAY = "var(--font-display, Georgia, serif)";
const BODY = "var(--font-body, Georgia, serif)";

// ---------- Spilloppsett for manuell inntasting ----------
type SpillCfg = { label: string; mainCount: number; bonusCount: number; bonusLabel: string; digits: boolean; nextDraw: { weekday: number; hour: number } };
const SPILL: Record<string, SpillCfg> = {
  LOTTO: { label: "Lotto", mainCount: 7, bonusCount: 1, bonusLabel: "Tilleggstall", digits: false, nextDraw: { weekday: 5, hour: 19 } },
  VIKINGLOTTO: { label: "Vikinglotto", mainCount: 6, bonusCount: 1, bonusLabel: "Vikingtall", digits: false, nextDraw: { weekday: 2, hour: 18 } },
  EUROJACKPOT: { label: "Eurojackpot", mainCount: 5, bonusCount: 2, bonusLabel: "Stjernetall", digits: false, nextDraw: { weekday: 4, hour: 21 } },
  JOKER: { label: "Joker", mainCount: 5, bonusCount: 0, bonusLabel: "", digits: true, nextDraw: { weekday: 5, hour: 19 } },
};
const SPILL_ORDER = ["LOTTO", "VIKINGLOTTO", "EUROJACKPOT", "JOKER"];

const WD = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MO = ["", "januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
function dateLabel(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return `${WD[d.getDay()]} ${d.getDate()}. ${MO[d.getMonth() + 1]} ${d.getFullYear()}`;
}
function parseNums(s: string, digits: boolean): number[] {
  if (digits) return s.replace(/\D/g, "").split("").map((x) => parseInt(x, 10));
  return s.split(/[^0-9]+/).filter((x) => x !== "").map((x) => parseInt(x, 10));
}

type Tier = { label: string; amount: string }; // amount "" = jackpot
type DrawForm = { game: string; drawDate: string; mainStr: string; bonusStr: string; tiers: Tier[]; turnover: string; note: string };
const TOM_DRAW: DrawForm = { game: "LOTTO", drawDate: "", mainStr: "", bonusStr: "", tiers: [{ label: "", amount: "" }], turnover: "", note: "Premieprognose (Norsk Tipping)" };

// ---------- Artikkel ----------
type Article = { slug: string; tittel: string; ingress: string; brodtekst: string; spill: string; tema: string; publisert: boolean };
const TOM_ART: Article = { slug: "", tittel: "", ingress: "", brodtekst: "", spill: "generell", tema: "guide", publisert: false };

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");
  const [tab, setTab] = useState<"trekninger" | "artikler">("trekninger");

  // artikler
  const [artikler, setArtikler] = useState<Article[]>([]);
  const [aForm, setAForm] = useState<Article>(TOM_ART);
  const [aStatus, setAStatus] = useState("");

  // trekninger
  const [d, setD] = useState<DrawForm>(TOM_DRAW);
  const [dStatus, setDStatus] = useState("");

  const H = (t: string) => ({ apikey: ANON, Authorization: `Bearer ${t}`, "Content-Type": "application/json" });

  async function loggInn() {
    setFeil("");
    try {
      const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
        method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" },
        body: JSON.stringify({ email: epost, password: passord }),
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) { setFeil(data.error_description || data.msg || "Innlogging feilet."); return; }
      setToken(data.access_token);
      lastArtikler(data.access_token);
    } catch { setFeil("Noe gikk galt ved innlogging."); }
  }

  // ---------- Artikler ----------
  async function lastArtikler(t: string) {
    const res = await fetch(`${URL}/rest/v1/articles?select=slug,tittel,ingress,brodtekst,spill,tema,publisert&order=dato.desc`, { headers: H(t) });
    if (res.ok) setArtikler(await res.json());
  }
  async function lagreArtikkel() {
    if (!token) return;
    setAStatus("Lagrer …");
    const slug = aForm.slug || aForm.tittel.toLowerCase().replace(/[æå]/g, "a").replace(/ø/g, "o").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const res = await fetch(`${URL}/rest/v1/articles?on_conflict=slug`, {
      method: "POST", headers: { ...H(token), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ ...aForm, slug }),
    });
    if (res.ok) { setAStatus("✓ Lagret" + (aForm.publisert ? " og publisert" : " (kladd)")); setAForm(TOM_ART); lastArtikler(token); }
    else { const e = await res.json().catch(() => ({})); setAStatus("Feil: " + (e.message || res.status)); }
  }

  // ---------- Trekninger ----------
  function velgSpill(g: string) { setD({ ...TOM_DRAW, game: g, tiers: [{ label: "", amount: "" }] }); setDStatus(""); }

  async function hentGjeldende() {
    if (!token) return;
    setDStatus("Henter gjeldende trekning fra basen …");
    const res = await fetch(`${URL}/rest/v1/draws?game=eq.${d.game}&order=draw_date.desc&limit=1&select=draw_date,payload`, { headers: H(token) });
    if (!res.ok) { setDStatus("Kunne ikke hente."); return; }
    const rows = await res.json();
    if (!rows[0]) { setDStatus("Ingen trekning i basen for dette spillet ennå — tast inn manuelt."); return; }
    const p = rows[0].payload || {};
    setD({
      game: d.game, drawDate: rows[0].draw_date,
      mainStr: (p.mainNumbers || []).join(" "),
      bonusStr: (p.bonusNumbers || []).join(" "),
      tiers: (p.prizeTiers || []).map((t: { label: string; amount: number | null }) => ({ label: t.label, amount: t.amount == null ? "" : String(t.amount) })) || [{ label: "", amount: "" }],
      turnover: p.turnoverKr ? String(p.turnoverKr) : "",
      note: p.prizeNote || "",
    });
    setDStatus("✓ Hentet — du kan nå rette tall/premier og publisere på nytt.");
  }

  async function hentAutomatisk() {
    if (!token) return;
    setDStatus("Ber om automatisk innhenting …");
    try {
      const res = await fetch(`/api/hent`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ game: d.game.toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) setDStatus("✓ Innhenting startet. Den kjører i bakgrunnen — sjekk om ett par minutter, eller tast inn manuelt hvis den feiler.");
      else setDStatus("Automatisk innhenting utilgjengelig (" + (data.error || res.status) + "). Bruk manuell inntasting under.");
    } catch { setDStatus("Automatisk innhenting utilgjengelig. Bruk manuell inntasting under."); }
  }

  function byggPayload() {
    const cfg = SPILL[d.game];
    const main = parseNums(d.mainStr, cfg.digits);
    const bonus = cfg.bonusCount ? parseNums(d.bonusStr, false) : [];
    const prizeTiers = d.tiers.filter((t) => t.label.trim()).map((t) => {
      const amt = t.amount.trim() === "" ? null : parseInt(t.amount.replace(/\D/g, ""), 10);
      return { label: t.label.trim(), amount: amt, jackpot: amt === null };
    });
    const countOrder = prizeTiers.map((_, i) => i).sort((a, b) => {
      const aa = prizeTiers[a].amount, bb = prizeTiers[b].amount;
      const an = aa === null, bn = bb === null;
      if (an !== bn) return an ? 1 : -1;
      return (aa || 0) - (bb || 0);
    });
    return {
      game: d.game, source: "manuell:admin",
      drawDateLabel: dateLabel(d.drawDate), drawDateIso: d.drawDate,
      mainNumbers: main, bonusNumbers: bonus, bonusLabel: cfg.bonusLabel || null,
      prizeTiers, countOrder, nextDraw: cfg.nextDraw,
      turnoverKr: d.turnover ? parseInt(d.turnover.replace(/\D/g, ""), 10) : null,
      prizeNote: d.note || null,
    };
  }

  async function publiserTrekning() {
    if (!token) return;
    const cfg = SPILL[d.game];
    const main = parseNums(d.mainStr, cfg.digits);
    if (!d.drawDate) { setDStatus("Mangler trekningsdato."); return; }
    if (main.length !== cfg.mainCount) { setDStatus(`Forventet ${cfg.mainCount} ${cfg.digits ? "sifre" : "hovedtall"}, fikk ${main.length}. Sjekk inntastingen.`); return; }
    setDStatus("Publiserer …");
    const payload = byggPayload();
    const res = await fetch(`${URL}/rest/v1/draws?on_conflict=game,draw_date`, {
      method: "POST", headers: { ...H(token), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ game: d.game, draw_date: d.drawDate, payload }),
    });
    if (res.ok) setDStatus("✓ Publisert! Trekningen er nå live på /" + d.game.toLowerCase() + " (oppdateres innen ~10 min).");
    else { const e = await res.json().catch(() => ({})); setDStatus("Feil ved publisering: " + (e.message || res.status)); }
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1px solid ${C.rule}`, fontFamily: UI, fontSize: 14, marginTop: 4, boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.dek, marginTop: 14, display: "block" };
  const btnDark: React.CSSProperties = { background: C.ink, color: "#fff", border: "none", padding: "10px 22px", fontFamily: UI, fontWeight: 700, cursor: "pointer" };
  const btnGhost: React.CSSProperties = { background: "none", border: `1px solid ${C.rule}`, padding: "10px 16px", fontFamily: UI, cursor: "pointer" };

  if (!token) {
    return (
      <Wrap>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 30 }}>Logg inn</h1>
        <p style={{ fontFamily: BODY, color: C.dek, fontSize: 15 }}>Admin for Lottoresultater.</p>
        <label style={lbl}>E-post</label>
        <input style={inp} value={epost} onChange={(e) => setEpost(e.target.value)} type="email" />
        <label style={lbl}>Passord</label>
        <input style={inp} value={passord} onChange={(e) => setPassord(e.target.value)} type="password" onKeyDown={(e) => e.key === "Enter" && loggInn()} />
        {feil && <p style={{ color: C.red, fontFamily: UI, fontSize: 14 }}>{feil}</p>}
        <button onClick={loggInn} style={{ ...btnDark, marginTop: 16 }}>Logg inn</button>
      </Wrap>
    );
  }

  const cfg = SPILL[d.game];

  return (
    <Wrap>
      {/* Faner */}
      <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${C.ink}`, marginBottom: 20 }}>
        {(["trekninger", "artikler"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontFamily: UI, fontSize: 15, fontWeight: tab === t ? 700 : 500, padding: "10px 18px", cursor: "pointer",
            border: "none", borderBottom: tab === t ? `3px solid ${C.red}` : "3px solid transparent",
            background: "none", color: tab === t ? C.ink : C.meta, marginBottom: -2,
          }}>{t === "trekninger" ? "Trekninger" : "Artikler"}</button>
        ))}
      </div>

      {tab === "trekninger" && (
        <>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, margin: "0 0 4px" }}>Trekninger</h1>
          <p style={{ fontFamily: BODY, color: C.dek, fontSize: 15, marginTop: 0 }}>Hent automatisk, eller tast inn tall og premier manuelt og publiser. Manuell inntasting sikrer at tjenesten er oppe selv om automatikken svikter.</p>

          {/* Spillknapper */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "14px 0" }}>
            {SPILL_ORDER.map((g) => (
              <button key={g} onClick={() => velgSpill(g)} style={{
                fontFamily: UI, fontSize: 14, padding: "8px 16px", cursor: "pointer", borderRadius: 2,
                border: `1px solid ${d.game === g ? C.ink : C.rule}`, background: d.game === g ? C.ink : "transparent",
                color: d.game === g ? "#fff" : C.ink, fontWeight: d.game === g ? 700 : 500,
              }}>{SPILL[g].label}</button>
            ))}
          </div>

          {/* Hent-knapper */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "6px 0 4px" }}>
            <button onClick={hentAutomatisk} style={{ ...btnDark, background: C.red }}>Hent automatisk</button>
            <button onClick={hentGjeldende} style={btnGhost}>Hent gjeldende (for å rette)</button>
          </div>
          {dStatus && <p style={{ fontFamily: UI, fontSize: 14, color: dStatus.startsWith("✓") ? C.ok : C.dek, background: C.page, padding: "10px 12px", borderRadius: 2, marginTop: 8 }}>{dStatus}</p>}

          {/* Manuell inntasting */}
          <h2 style={{ fontFamily: UI, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.meta, borderBottom: `1px solid ${C.rule}`, paddingBottom: 6, marginTop: 26 }}>Manuell inntasting — {cfg.label}</h2>

          <label style={lbl}>Trekningsdato</label>
          <input style={inp} type="date" value={d.drawDate} onChange={(e) => setD({ ...d, drawDate: e.target.value })} />

          <label style={lbl}>{cfg.digits ? `Sifre (${cfg.mainCount} stk, i rekkefølge)` : `Hovedtall (${cfg.mainCount} stk)`} — skill med mellomrom</label>
          <input style={inp} value={d.mainStr} onChange={(e) => setD({ ...d, mainStr: e.target.value })} placeholder={cfg.digits ? "4 1 0 2 3" : "5 6 7 20 25 28 34"} />

          {cfg.bonusCount > 0 && (
            <>
              <label style={lbl}>{cfg.bonusLabel} ({cfg.bonusCount} stk)</label>
              <input style={inp} value={d.bonusStr} onChange={(e) => setD({ ...d, bonusStr: e.target.value })} placeholder={cfg.bonusCount > 1 ? "1 3" : "31"} />
            </>
          )}

          <label style={lbl}>Premier — la beløp stå tomt for JACKPOT</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {d.tiers.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <input style={{ ...inp, marginTop: 0, flex: 2 }} value={t.label} placeholder={cfg.digits ? "5 rette" : "7 rette"} onChange={(e) => { const ts = [...d.tiers]; ts[i] = { ...ts[i], label: e.target.value }; setD({ ...d, tiers: ts }); }} />
                <input style={{ ...inp, marginTop: 0, flex: 1 }} value={t.amount} placeholder="kr (tom = jackpot)" onChange={(e) => { const ts = [...d.tiers]; ts[i] = { ...ts[i], amount: e.target.value }; setD({ ...d, tiers: ts }); }} />
                <button onClick={() => setD({ ...d, tiers: d.tiers.filter((_, k) => k !== i) })} style={{ ...btnGhost, padding: "0 12px" }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={() => setD({ ...d, tiers: [...d.tiers, { label: "", amount: "" }] })} style={{ ...btnGhost, marginTop: 8, fontSize: 13, padding: "6px 12px" }}>+ Legg til premierad</button>

          <label style={lbl}>Omsetning (valgfritt, kr)</label>
          <input style={inp} value={d.turnover} onChange={(e) => setD({ ...d, turnover: e.target.value })} placeholder="73398300" />

          <label style={lbl}>Premie-merknad (valgfritt)</label>
          <input style={inp} value={d.note} onChange={(e) => setD({ ...d, note: e.target.value })} />

          <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={publiserTrekning} style={btnDark}>Lagre og publiser</button>
            <button onClick={() => velgSpill(d.game)} style={btnGhost}>Tøm</button>
          </div>
        </>
      )}

      {tab === "artikler" && (
        <>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, marginBottom: 4 }}>Ny / rediger artikkel</h1>
          <label style={lbl}>Tittel</label>
          <input style={inp} value={aForm.tittel} onChange={(e) => setAForm({ ...aForm, tittel: e.target.value })} />
          <label style={lbl}>Slug (la stå tom for automatisk)</label>
          <input style={inp} value={aForm.slug} onChange={(e) => setAForm({ ...aForm, slug: e.target.value })} placeholder="lages av tittelen" />
          <label style={lbl}>Ingress</label>
          <textarea style={{ ...inp, minHeight: 60 }} value={aForm.ingress} onChange={(e) => setAForm({ ...aForm, ingress: e.target.value })} />
          <label style={lbl}>Brødtekst (markdown: # overskrift, **fet**, - punkt, [tekst](lenke))</label>
          <textarea style={{ ...inp, minHeight: 300, fontFamily: "monospace" }} value={aForm.brodtekst} onChange={(e) => setAForm({ ...aForm, brodtekst: e.target.value })} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Spill</label>
              <select style={inp} value={aForm.spill} onChange={(e) => setAForm({ ...aForm, spill: e.target.value })}>
                {["generell", "lotto", "vikinglotto", "eurojackpot", "joker"].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Tema</label>
              <select style={inp} value={aForm.tema} onChange={(e) => setAForm({ ...aForm, tema: e.target.value })}>
                {["guide", "statistikk", "forbrukervern", "nyhet"].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={aForm.publisert} onChange={(e) => setAForm({ ...aForm, publisert: e.target.checked })} />
            Publiser (synlig på siden). La stå av for kladd.
          </label>
          <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={lagreArtikkel} style={btnDark}>Lagre</button>
            {aForm.slug && <button onClick={() => setAForm(TOM_ART)} style={btnGhost}>Ny/tøm</button>}
            {aStatus && <span style={{ fontFamily: UI, fontSize: 14, color: aStatus.startsWith("✓") ? C.ok : C.red }}>{aStatus}</span>}
          </div>
          <h2 style={{ fontFamily: UI, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.meta, borderBottom: `2px solid ${C.ink}`, paddingBottom: 6, marginTop: 34 }}>Alle artikler</h2>
          {artikler.map((a) => (
            <div key={a.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #ece8e0" }}>
              <span style={{ fontFamily: BODY, fontSize: 15 }}>{a.tittel} {!a.publisert && <em style={{ color: C.meta, fontSize: 13 }}>(kladd)</em>}</span>
              <button onClick={() => setAForm(a)} style={{ ...btnGhost, padding: "4px 12px", fontSize: 13 }}>Rediger</button>
            </div>
          ))}
        </>
      )}
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.page, minHeight: "100vh", color: C.ink }}>
      <div style={{ maxWidth: 720, margin: "0 auto", background: C.card, padding: "24px 20px 48px" }}>{children}</div>
    </div>
  );
}
