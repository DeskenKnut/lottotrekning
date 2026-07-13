import Link from "next/link";

export const revalidate = 86400;

export const metadata = {
  title: "Om oss – Lottoresultater | Utgitt av Desken AS",
  description:
    "Lottoresultater er en uavhengig tjeneste som samler resultater, vinnertall og statistikk for norske lotterier. Utgitt av Desken AS. Kontakt og redaksjonell linje.",
};

const C = { ink: "#1a1512", page: "#e9e6df", card: "#fdfcfa", rule: "#c9c2b6", dek: "#4a4038", meta: "#9a9186", red: "#a3211f" };
const DISPLAY = "var(--font-display, Georgia, serif)";
const BODY = "var(--font-body, Georgia, serif)";
const UI = "var(--font-ui, system-ui, sans-serif)";
const PAD = "clamp(20px, 4vw, 40px)";

const NAV = [
  ["Lotto", "/lotto"], ["Vikinglotto", "/vikinglotto"], ["Eurojackpot", "/eurojackpot"],
  ["Joker", "/joker"], ["Lykketall", "/lykketall"], ["Extra", "/extra"], ["Statistikk", "/statistikk"], ["Artikler", "/artikler"],
];

export default function OmOss() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lottoresultater",
    legalName: "Desken AS",
    url: "https://lottoresultater.no",
    email: "lottoresultater@desken.no",
    description: "Uavhengig tjeneste for norske lottoresultater, vinnertall og statistikk.",
    publishingPrinciples: "https://lottoresultater.no/om-oss",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.page, minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ width: "100%", maxWidth: "clamp(360px, 94vw, 820px)", background: C.card, minHeight: "100vh", display: "flex", flexDirection: "column", color: C.ink }}>
        <header style={{ borderBottom: `2px solid ${C.ink}`, padding: `18px ${PAD} 0` }}>
          <Link href="/" style={{ display: "block", textDecoration: "none", color: C.ink, textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(30px,6vw,52px)", letterSpacing: "-0.5px", lineHeight: 1 }}>Lottoresultater</div>
            <div style={{ fontFamily: UI, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.meta, margin: "8px 0 14px" }}>Norske lottoresultater og trekning</div>
          </Link>
          <nav style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${C.rule}`, padding: "10px 0" }}>
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} style={{ fontFamily: UI, fontSize: 13, letterSpacing: 0.3, textDecoration: "none", padding: "4px 11px", color: C.ink, fontWeight: 500 }}>{label}</Link>
            ))}
          </nav>
        </header>

        <main style={{ padding: `30px ${PAD}`, flex: 1, fontFamily: BODY, fontSize: 17, lineHeight: 1.65, color: C.ink }}>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, lineHeight: 1.08, margin: "0 0 16px" }}>Om Lottoresultater</h1>

          <p>Lottoresultater er en uavhengig tjeneste som samler vinnertall, trekninger og premier fra norske lotterier på ett sted. Målet vårt er enkelt: å gi deg de siste resultatene raskt og ryddig, sammen med ærlig statistikk og forbrukeropplysning.</p>

          <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, margin: "26px 0 8px" }}>Hva vi gjør</h2>
          <p>Vi publiserer resultatene fra Lotto, Vikinglotto, Eurojackpot, Joker og Extra fortløpende etter hver trekning. I tillegg har vi bygget opp et arkiv med over ti år med trekninger, som ligger til grunn for statistikksidene våre — hvilke tall som er trukket oftest, sjeldnest, og hvordan de fordeler seg over tid.</p>

          <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, margin: "26px 0 8px" }}>Lange linjer</h2>
          <p>Lottoresultater er ikke en ny tjeneste. Vi har publisert norske lottoresultater i over ti år — nettstedet er dokumentert aktivt helt tilbake til januar 2014 gjennom Internet Archive (Wayback Machine), og resultatarkivet vårt teller i dag over 2 200 trekninger. Den kontinuiteten er en del av grunnlaget vårt: en etablert, uavhengig opplysningstjeneste som har levert vinnertall lørdag etter lørdag, år etter år.</p>

          <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, margin: "26px 0 8px" }}>Vår redaksjonelle linje</h2>
          <p>Vi er en uavhengig tjeneste og er ikke tilknyttet Norsk Tipping. Resultatene vi gjengir er ment som opplysning — sjekk alltid mot din offisielle kupong hos Norsk Tipping før du regner en gevinst som bekreftet.</p>
          <p>Vi er tydelige på én ting: lotteri er tilfeldighet. Ingen statistikk, app eller metode kan forutsi hvilke tall som trekkes, og vi lover aldri økt vinnersjanse. Tallene og statistikken vår er historiske fakta, ikke spilltips. Denne ærligheten er en del av hvorfor du kan stole på det du leser her.</p>

          <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, margin: "26px 0 8px" }}>Utgiver og kontakt</h2>
          <p>Lottoresultater utgis av <strong>Desken AS</strong>, org.nr 984 358 202 MVA. Har du spørsmål, rettelser eller innspill, når du oss på e-post: <a href="mailto:lottoresultater@desken.no" style={{ color: C.red }}>lottoresultater@desken.no</a>.</p>

          <div style={{ background: C.page, border: `1px solid ${C.rule}`, borderRadius: 2, padding: "16px 18px", marginTop: 20, fontFamily: UI, fontSize: 14, lineHeight: 1.6 }}>
            <strong>Ansvarlig spill.</strong> Lotteri er underholdning, ikke en spare- eller investeringsform. Du må være 18 år for å spille. Trenger du noen å snakke med om spill? Ring Hjelpelinjen: 800 800 40.
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
