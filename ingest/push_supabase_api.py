"""
push_supabase_api.py — henter siste trekning fra api.norsk-tipping.no og lagrer i Supabase.
Ingen Playwright, ingen nettleser — bare et HTTP-kall som gir JSON.
 
Miljøvariabler (GitHub Secrets):
  SUPABASE_URL, SUPABASE_SERVICE_KEY
"""
import os
import requests
 
from api_adapter import ApiResultAdapter
from lotto_ingest import validate_draw
from site_contract import to_site_payload
 
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
 
GAMES = ["lotto", "vikinglotto"]   # utvid når flere spill er bekreftet
 
 
def upsert_draw(row: dict) -> None:
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/draws?on_conflict=game,draw_date",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        json=row, timeout=15,
    )
    resp.raise_for_status()
 
 
def main() -> None:
    adapter = ApiResultAdapter()
    for game in GAMES:
        try:
            result = adapter.fetch(game)
        except Exception as e:  # noqa
            print(f"[SKIP] {game}: henting feilet: {e}")
            continue
        errors = [e for e in validate_draw(result) if not e.startswith("MERK:")]
        if errors:
            print(f"[SKIP] {game}: {errors}")   # -> admin-varsling i prod
            continue
        payload = to_site_payload(result)
        upsert_draw({
            "game": payload["game"],
            "draw_date": payload["drawDateIso"],
            "payload": payload,
        })
        print(f"[OK] {game} {payload['drawDateIso']} lagret")
 
 
if __name__ == "__main__":
    main()
