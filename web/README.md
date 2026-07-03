# web — Lottoresultater (funksjonstest)

Next.js-frontend som leser trekninger fra Supabase og viser dem.

## Slik tar du den i bruk (Vercel)
1. Last opp hele denne `web/`-mappen til GitHub-repoet.
2. I Vercel: importer repoet, sett **Root Directory = `web`**.
3. Vercel → Settings → Environment Variables, legg inn (verdier fra Supabase → Project Settings → API):
   - `NEXT_PUBLIC_SUPABASE_URL`  = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public-nøkkelen
4. Deploy. Åpne `…vercel.app/lotto`.

## Merk
- Testen er satt til **noindex** (app/layout.tsx + app/robots.ts). Fjern det først når dere går live på hoveddomenet.
- Får du «Ingen resultater ennå»: kjør GitHub Actions-innhentingen, og sjekk at miljøvariablene er satt.
