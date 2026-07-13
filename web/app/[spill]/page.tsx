import GameResultPage from "@/components/GameResultPage";
import { getLatestDraw } from "@/lib/getLatestDraw";

export const revalidate = 600; // henter ferske data hvert 10. minutt

// Søkeord-rike meta-titler og -beskrivelser per spill (vises i Google og nettleserfanen).
const META: Record<string, { title: string; description: string }> = {
  lotto: {
    title: "Lottoresultater og lottotrekning – siste vinnertall",
    description:
      "Se de siste lottoresultatene fra lørdagens lottotrekning: vinnertall, tilleggstall og premier. Oppdateres automatisk etter hver trekning.",
  },
  vikinglotto: {
    title: "Vikinglotto resultater og trekning – siste vinnertall",
    description:
      "Vikinglotto-resultater og vinnertall fra onsdagens trekning, med vikingtall og premier. Oppdateres automatisk etter hver trekning.",
  },
  eurojackpot: {
    title: "Eurojackpot resultater – siste vinnertall og trekning",
    description:
      "Eurojackpot-resultater fra fredagens trekning: vinnertall, stjernetall og premier. Oppdateres automatisk etter hver trekning.",
  },
  joker: {
    title: "Joker resultater og trekning – siste vinnertall",
    description:
      "Joker-resultater og vinnertall fra onsdagens og lørdagens jokertrekning, med premier. Oppdateres automatisk etter hver trekning.",
  },
};

export async function generateMetadata({ params }: { params: { spill: string } }) {
  const m = META[params.spill?.toLowerCase()] ?? {
    title: "Lottoresultater – siste vinnertall og trekning",
    description: "Siste vinnertall, trekninger og premier fra norske lotterier. Oppdateres automatisk.",
  };
  return { title: m.title, description: m.description };
}

export default async function Page({ params }: { params: { spill: string } }) {
  const payload = await getLatestDraw(params.spill);

  if (!payload) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto", padding: 40 }}>
        <p>Ingen resultater for «{params.spill}» ennå.</p>
        <p style={{ color: "#777" }}>
          Kjør innhentingen (GitHub Actions) og sjekk at miljøvariablene i Vercel er satt.
        </p>
        <p><a href="/">← Til forsiden</a></p>
      </div>
    );
  }
  return <GameResultPage payload={payload} />;
}
