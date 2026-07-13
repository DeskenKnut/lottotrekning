import Link from "next/link";

export const metadata = {
  title: "Personvernerklæring – Lottoresultater",
  description: "Hvordan Lottoresultater (Desken AS) behandler personopplysninger, bruker informasjonskapsler og innhenter samtykke for annonser og analyse.",
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

function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(20px,3vw,26px)", margin: "28px 0 8px", lineHeight: 1.2 }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: BODY, fontSize: 16.5, lineHeight: 1.65, color: C.ink, margin: "0 0 12px" }}>{children}</p>;
}

export default function Personvern() {
  const oppdatert = "13. juli 2026";
  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.page, minHeight: "100vh" }}>
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

        <main style={{ padding: `28px ${PAD}`, flex: 1 }}>
          <div style={{ fontFamily: UI, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: C.red, fontWeight: 700 }}>Personvern</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, lineHeight: 1.06, margin: "6px 0 6px" }}>Personvernerklæring</h1>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.meta, marginBottom: 20 }}>Sist oppdatert {oppdatert}</p>

          <P>Denne erklæringen forklarer hvordan Lottoresultater behandler personopplysninger når du besøker nettstedet vårt, hvilke informasjonskapsler vi bruker, og hvilke rettigheter du har.</P>

          <H>Hvem er behandlingsansvarlig</H>
          <P>Nettstedet drives og utgis av <strong>Desken AS</strong> (org.nr 984 358 202 MVA). Vi er behandlingsansvarlig for personopplysningene som behandles gjennom nettstedet. Har du spørsmål om personvern, kontakt oss på <a href="mailto:lottoresultater@desken.no" style={{ color: C.red }}>lottoresultater@desken.no</a>.</P>

          <H>Hvilke opplysninger vi behandler</H>
          <P>Vi driver et innholdsnettsted og lagrer ingen brukerkontoer for besøkende. Opplysninger behandles i hovedsak gjennom tredjeparts-tjenester vi bruker for å drifte og finansiere siden:</P>
          <P><strong>Annonser (Google AdSense).</strong> Vi viser annonser levert av Google. For å vise og måle annonser kan Google og annonsepartnere bruke informasjonskapsler og lignende teknologi til å samle inn data som IP-adresse, enhets- og nettleserinformasjon og hvordan du bruker siden. Der det kreves, vises annonser kun etter samtykke.</P>
          <P><strong>Analyse.</strong> Vi kan bruke analyseverktøy (for eksempel Google Analytics) til å forstå hvordan siden brukes – hvilke sider som besøkes og hvor trafikken kommer fra. Slik analyse aktiveres kun med samtykke der det kreves.</P>
          <P><strong>Tekniske serverlogger.</strong> Som de fleste nettsteder logges tekniske data (som IP-adresse og tidspunkt) midlertidig for sikkerhet og feilsøking hos vår leverandør.</P>

          <H>Informasjonskapsler og samtykke</H>
          <P>Informasjonskapsler (cookies) er små filer som lagres i nettleseren din. Vi bruker dem til annonser og eventuell analyse. For besøkende i EØS, Storbritannia og Sveits ber vi om samtykke før slike informasjonskapsler tas i bruk, gjennom en samtykkeboks som vises første gang du besøker siden.</P>
          <P>Du kan når som helst endre eller trekke tilbake samtykket ditt via personverninnstillingene, som er tilgjengelige fra samtykkeboksen og i bunnen av siden.</P>

          <H>Deling med tredjeparter</H>
          <P>Vi selger ikke personopplysninger. Opplysninger behandles av leverandørene som gjør driften mulig – blant annet Google (annonser og analyse) og vår vertsleverandør. Disse behandler data på våre vegne eller som selvstendige behandlingsansvarlige i tråd med sine egne vilkår.</P>

          <H>Rettighetene dine</H>
          <P>Etter personvernforordningen (GDPR) har du blant annet rett til innsyn i opplysninger om deg, retting, sletting, og til å trekke tilbake samtykke. Du har også rett til å klage til Datatilsynet dersom du mener behandlingen er i strid med regelverket. For å utøve rettighetene dine, kontakt oss på <a href="mailto:lottoresultater@desken.no" style={{ color: C.red }}>lottoresultater@desken.no</a>.</P>

          <H>Endringer</H>
          <P>Vi kan oppdatere denne erklæringen ved behov. Vesentlige endringer merkes med ny «sist oppdatert»-dato øverst.</P>

          <div style={{ marginTop: 26, borderTop: `1px solid ${C.rule}`, paddingTop: 14 }}>
            <P>Lottoresultater er en uavhengig opplysningstjeneste og er <strong>ikke tilknyttet Norsk Tipping</strong>. Spilleavhengighet? Ring Hjelpelinjen 800 800 40. Du må være 18 år for å spille.</P>
          </div>
        </main>

        <footer style={{ marginTop: "auto", borderTop: `2px solid ${C.ink}`, padding: `22px ${PAD}`, fontFamily: UI, fontSize: 12.5, color: C.dek, lineHeight: 1.6 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>Lottoresultater</div>
          <div style={{ marginTop: 6 }}>Utgitt av Desken AS (org.nr 984 358 202 MVA). Uavhengig tjeneste — ikke tilknyttet Norsk Tipping.</div>
          <div style={{ marginTop: 6 }}><Link href="/om-oss" style={{ color: C.red }}>Om oss</Link> · <Link href="/personvern" style={{ color: C.red }}>Personvern</Link></div>
        </footer>
      </div>
    </div>
  );
}
