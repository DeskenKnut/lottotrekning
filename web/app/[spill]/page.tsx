import GameResultPage from "@/components/GameResultPage";
import { getLatestDraw } from "@/lib/getLatestDraw";

export const revalidate = 600; // henter ferske data hvert 10. minutt

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
