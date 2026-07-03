"""
push_supabase.py — kjør innhenting og lagre resultatet i Supabase.

Kjøres av GitHub Actions på trekningsplanen. Krever to miljøvariabler
(settes som GitHub Secrets, se runbooken):
  SUPABASE_URL          f.eks. https://abcd1234.supabase.co
  SUPABASE_SERVICE_KEY  service_role-nøkkelen (KUN server-side / i Secrets)

Du trenger ikke endre koden — bare sette variablene og listen GAMES.
"""
import os
import requests

from harvest import harvest_html
from sources import BrowserHtmlSource   # Playwright rendrer NT sin SPA

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# Start med Lotto. Utvid når de andre spillenes tallstruktur er bekreftet.
GAMES = ["lotto"]


def upsert_draw(row: dict) -> None:
    """Lagre (eller oppdatere) én trekning i tabellen 'draws'."""
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/draws",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",  # upsert på (game, draw_date)
        },
        json=row,
        timeout=15,
    )
    resp.raise_for_status()


def main() -> None:
    source = BrowserHtmlSource()
    for game in GAMES:
        h = harvest_html(game, source)
        if not h.ok:
            # I produksjon: koble dette til admin-varsling (Fase1-pipeline seksjon 5)
            print(f"[SKIP] {game}: {h.errors}")
            continue
        upsert_draw({
            "game": h.payload["game"],
            "draw_date": h.payload["drawDateIso"],
            "payload": h.payload,
        })
        print(f"[OK] {game} {h.payload['drawDateIso']} lagret i Supabase")


if __name__ == "__main__":
    main()
