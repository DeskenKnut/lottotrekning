"use client";
import { useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f", ok: "#1f6b4a" };

type Article = {
  slug: string; tittel: string; ingress: string; brodtekst: string;
  spill: string; tema: string; publisert: boolean;
};

const TOM: Article = { slug: "", tittel: "", ingress: "", brodtekst: "", spill: "generell", tema: "guide", publisert: false };

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");
  const [artikler, setArtikler] = useState<Article[]>([]);
  const [form, setForm] = useState<Article>(TOM);
  const [status, setStatus] = useState("");

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
      last(data.access_token);
    } catch { setFeil("Noe gikk galt ved innlogging."); }
  }

  async function last(t: string) {
    const res = await fetch(`${URL}/rest/v1/articles?select=slug,tittel,ingress,brodtekst,spill,tema,publisert&order=dato.desc`, { headers: H(t) });
    if (res.ok) setArtikler(await res.json());
  }

  async function lagre() {
    if (!token) return;
    setStatus("Lagrer …");
    const slug = form.slug || form.tittel.toLowerCase().replace(/[æå]/g, "a").replace(/ø/g, "o").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const body = { ...form, slug };
    const res = await fetch(`${URL}/rest/v1/articles?on_conflict=slug`, {
      method: "POST", headers: { ...H(token), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(body),
    });
    if (res.ok) { setStatus("✓ Lagret" + (form.publisert ? " og publisert" : " (kladd)")); setForm(TOM); last(token); }
    else { const e = await res.json().catch(() => ({})); setStatus("Feil: " + (e.message || res.status)); }
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1px solid ${C.rule}`, fontFamily: "var(--font-ui)", fontSize: 14, marginTop: 4, boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: C.dek, marginTop: 14, display: "block" };

  if (!token) {
    return (
      <Wrap>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 30 }}>Logg inn</h1>
        <p style={{ fontFamily: "var(--font-body)", color: C.dek, fontSize: 15 }}>Admin for Lottotrekning.</p>
        <label style={lbl}>E-post</label>
        <input style={inp} value={epost} onChange={(e) => setEpost(e.target.value)} type="email" />
        <label style={lbl}>Passord</label>
        <input style={inp} value={passord} onChange={(e) => setPassord(e.target.value)} type="password" onKeyDown={(e) => e.key === "Enter" && loggInn()} />
        {feil && <p style={{ color: C.red, fontFamily: "var(--font-ui)", fontSize: 14 }}>{feil}</p>}
        <button onClick={loggInn} style={{ marginTop: 16, background: C.ink, color: "#fff", border: "none", padding: "10px 20px", fontFamily: "var(--font-ui)", fontWeight: 700, cursor: "pointer" }}>Logg inn</button>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 30, marginBottom: 4 }}>Ny / rediger artikkel</h1>

      <label style={lbl}>Tittel</label>
      <input style={inp} value={form.tittel} onChange={(e) => setForm({ ...form, tittel: e.target.value })} />

      <label style={lbl}>Slug (nettadresse — la stå tom for automatisk)</label>
      <input style={inp} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="lages av tittelen" />

      <label style={lbl}>Ingress (kort sammendrag)</label>
      <textarea style={{ ...inp, minHeight: 60 }} value={form.ingress} onChange={(e) => setForm({ ...form, ingress: e.target.value })} />

      <label style={lbl}>Brødtekst (markdown: # overskrift, **fet**, - punkt, [tekst](lenke))</label>
      <textarea style={{ ...inp, minHeight: 300, fontFamily: "monospace" }} value={form.brodtekst} onChange={(e) => setForm({ ...form, brodtekst: e.target.value })} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Spill</label>
          <select style={inp} value={form.spill} onChange={(e) => setForm({ ...form, spill: e.target.value })}>
            {["generell", "lotto", "vikinglotto", "eurojackpot", "joker"].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Tema</label>
          <select style={inp} value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })}>
            {["guide", "statistikk", "forbrukervern", "nyhet"].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>

      <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={form.publisert} onChange={(e) => setForm({ ...form, publisert: e.target.checked })} />
        Publiser (synlig på siden). La stå av for kladd.
      </label>

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={lagre} style={{ background: C.ink, color: "#fff", border: "none", padding: "10px 22px", fontFamily: "var(--font-ui)", fontWeight: 700, cursor: "pointer" }}>Lagre</button>
        {form.slug && <button onClick={() => setForm(TOM)} style={{ background: "none", border: `1px solid ${C.rule}`, padding: "10px 16px", fontFamily: "var(--font-ui)", cursor: "pointer" }}>Ny/tøm</button>}
        {status && <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: status.startsWith("✓") ? C.ok : C.red }}>{status}</span>}
      </div>

      <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: C.meta, borderBottom: `2px solid ${C.ink}`, paddingBottom: 6, marginTop: 34 }}>Alle artikler</h2>
      {artikler.map((a) => (
        <div key={a.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #ece8e0" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 15 }}>
            {a.tittel} {!a.publisert && <em style={{ color: C.meta, fontSize: 13 }}>(kladd)</em>}
          </span>
          <button onClick={() => setForm(a)} style={{ background: "none", border: `1px solid ${C.rule}`, padding: "4px 12px", fontFamily: "var(--font-ui)", fontSize: 13, cursor: "pointer" }}>Rediger</button>
        </div>
      ))}
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
