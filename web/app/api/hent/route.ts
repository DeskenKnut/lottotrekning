// Serverless-rute som trigger den automatiske innhentingen (GitHub Actions).
// Krever oppsett i Vercel (se KRAV under). Verifiserer at kallet kommer fra en
// innlogget admin før den trigger workflowen.
//
// KRAV (miljøvariabler i Vercel):
//   GH_DISPATCH_TOKEN  = GitHub fine-grained token med "Actions: write" på repoet
//   GH_REPO            = "DeskenKnut/lottotrekning"   (eier/repo)
//   GH_WORKFLOW        = "ingest.yml"                  (workflow-filnavn)
//   GH_REF             = "main"
// I ingest.yml må workflow_dispatch tillate en valgfri input "game" (se guide).

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  // 1) Verifiser at brukeren er innlogget (Supabase-token i Authorization)
  const auth = req.headers.get("authorization") || "";
  const jwt = auth.replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false, error: "Ikke innlogget" }, { status: 401 });
  const who = await fetch(`${SUPA}/auth/v1/user`, { headers: { apikey: ANON, Authorization: `Bearer ${jwt}` } });
  if (!who.ok) return Response.json({ ok: false, error: "Ugyldig innlogging" }, { status: 401 });

  // 2) Trigger GitHub Actions
  const token = process.env.GH_DISPATCH_TOKEN;
  const repo = process.env.GH_REPO;
  const wf = process.env.GH_WORKFLOW || "ingest.yml";
  const ref = process.env.GH_REF || "main";
  if (!token || !repo) {
    return Response.json({ ok: false, error: "Automatisk innhenting ikke satt opp (mangler GH_DISPATCH_TOKEN / GH_REPO)" }, { status: 501 });
  }

  let game: string | undefined;
  try { game = (await req.json())?.game; } catch { /* ingen body */ }

  const gh = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${wf}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref, inputs: game ? { game } : {} }),
  });

  if (gh.status === 204) return Response.json({ ok: true });
  const t = await gh.text();
  return Response.json({ ok: false, error: `GitHub ${gh.status}: ${t.slice(0, 200)}` }, { status: 502 });
}
