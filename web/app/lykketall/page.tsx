import Link from "next/link";
import LykketallGenerator from "../../components/LykketallGenerator";

export const revalidate = 86400;

export const metadata = {
  title: "Lykketallgenerator – tilfeldige lottotall for Lotto, Vikinglotto, Eurojackpot og Joker",
  description:
    "Generer tilfeldige lottotall til Lotto, Vikinglotto, Eurojackpot og Joker. Gratis lykketallgenerator med mulighet for å unngå populære tall.",
};

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f" };
const DISPLAY = "var(--font-display, Georgia, serif)";
const BODY = "var(--font-body, Georgia, serif)";
const UI = "var(--font-ui, system-ui, sans-serif)";
const PAD = "clamp(20px, 4vw, 40px)";

const NAV = [
  ["Lotto", "/lotto"], ["Vikinglotto", "/vikinglotto"], ["Eurojackpot", "/eurojackpot"],
  ["Joker", "/joker"], ["Lykketall", "/lykketall"], ["Statistikk", "/statistikk"], ["Artikler", "/artikler"],
];

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Øker en lykketallgenerator vinnersjansen?",
      acceptedAnswer: { "@type": "Answer", text: "Nei. En generator gir tilfeldige tall, og alle rekker har nøyaktig lik sjanse i et lotteri. Ingen metode kan forutsi hvilke tall som trekkes." },
    },
    {
      "@type": "Question",
      name: "Hva betyr det å unngå populære tall?",
      acceptedAnswer: { "@type": "Answer", text: "Mange velger tall under 32 (fødselsdatoer). Velger du tall få andre spiller, endrer det ikke sjansen for å vinne – men vinner du, deler færre premien med deg, så utbetalingen din blir større." },
    },
  ],
};

export default function LykketallPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.page, minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <div style={{ width: "100%", maxWidth: "clamp(360px, 94vw, 820px)", background: C.card, minHeight: "100vh", display: "flex", flexDirection: "column", color: C.ink }}>
        <header style={{ borderBottom: `2px solid ${C.ink}`, padding: `18px ${PAD} 0` }}>
          <Link href="/" style={{ display: "block", textDecoration: "none", color: C.ink, textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(30px,6vw,52px)", letterSpacing: "-0.5px", lineHeight: 1 }}>Lottoresultater</div>
            <div style={{ fontFamily: UI, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.meta, margin: "8px 0 14px" }}>Norske lottoresultater og trekning</div>
          </Link>
          <nav style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${C.rule}`, padding: "10px 0" }}>
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} style={{ fontFamily: UI, fontSize: 13, letterSpacing: 0.3, textDecoration: "none", padding: "4px 11px", color: href === "/lykketall" ? C.red : C.ink, fontWeight: href === "/lykketall" ? 700 : 500 }}>{label}</Link>
            ))}
          </nav>
        </header>

        <main style={{ padding: `28px ${PAD}`, flex: 1 }}>
          <div style={{ fontFamily: UI, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: C.red, fontWeight: 700 }}>Verktøy</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, lineHeight: 1.06, margin: "6px 0 12px" }}>Lykketallgenerator</h1>
          <p style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: C.ink, maxWidth: 640, marginBottom: 24 }}>
            Slipp å velge selv – trekk en tilfeldig rekke til Lotto, Vikinglotto, Eurojackpot eller Joker. Velg spill, trykk på knappen, og se tallene rulle inn.
          </p>

          <LykketallGenerator />

          <div style={{ marginTop: 34, borderTop: `1px solid ${C.rule}`, paddingTop: 20, maxWidth: 640 }}>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Øker dette vinnersjansen?</h2>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: C.dek }}>
              Nei – og det er viktig å være ærlig om. En generator gir tilfeldige tall, og i et lotteri har alle rekker nøyaktig lik sjanse hver eneste trekning. Ingen tall er «varmere» enn andre, og ingen metode kan forutsi hva som trekkes.
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, margin: "20px 0 8px" }}>Hva «unngå populære tall» faktisk gjør</h2>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: C.dek }}>
              Veldig mange spiller tall under 32, fordi de bruker fødselsdatoer. Velger du tall som få andre spiller, endrer det <em>ikke</em> sjansen din for å vinne – men skulle du først vinne, deler færre premien med deg. Da blir utbetalingen din større. Det er den eneste reelle, matematiske fordelen som finnes i tallvalg – og den handler om utbetaling, ikke om sannsynlighet.
            </p>
            <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: C.meta, marginTop: 14 }}>
              Vil du se hvilke tall som faktisk er trukket oftest gjennom årene? Se <Link href="/statistikk" style={{ color: C.red }}>statistikken vår</Link> – historiske fakta, ikke spilltips.
            </p>
          </div>
        </main>

        <footer style={{ marginTop: "auto", borderTop: `2px solid ${C.ink}`, padding: `22px ${PAD}`, fontFamily: UI, fontSize: 12.5, color: C.dek, lineHeight: 1.6 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>Lottoresultater</div>
          <div style={{ marginTop: 6 }}>Utgitt av Desken AS (org.nr 984 358 202 MVA). Uavhengig tjeneste — ikke tilknyttet Norsk Tipping.</div>
          <div style={{ marginTop: 6, color: C.meta }}>Spilleavhengighet? Ring Hjelpelinjen 800 800 40. Du må være 18 år for å spille.</div>
        </footer>
      </div>
    </div>
  );
}
