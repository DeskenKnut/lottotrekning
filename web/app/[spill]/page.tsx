import GameResultPage from "@/components/GameResultPage";
import { getLatestDraw } from "@/lib/getLatestDraw";
import lottoSeed from "@/data/lotto.json";

// Seed-data vises hvis Supabase ikke svarer ennå (kun Lotto har seed foreløpig).
const SEED: Record<string, any> = { lotto: lottoSeed };

export const revalidate = 600; // hent ferske data hvert 10. min

export default async function Page({ params }: { params: { spill: string } }) {
  const key = params.spill.toLowerCase();
  const live = await getLatestDraw(key);
  const payload = live ?? SEED[key] ?? null;

  if (!payload) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", padding: 40 }}>
        Ingen resultater ennå for «{params.spill}».
      </main>
    );
  }
  return <GameResultPage payload={payload} />;
}
