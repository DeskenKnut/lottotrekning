# web — Lottotrekning frontend (Next.js)

## Deploy til Vercel
1. Importer repoet i Vercel. Sett **Root Directory = `web`**.
2. Legg inn to Environment Variables (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon-nøkkel
3. Deploy. Åpne `/lotto`.

Uten miljøvariabler viser siden seed-data (ekte 27. juni-trekning) så du ser at det virker.
Med variablene henter den live fra Supabase.

Siden er `noindex` (funksjonstest). Fjern i `app/layout.tsx` og `app/robots.ts` når dere går live på hoveddomenet.
