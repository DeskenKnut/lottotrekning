"""
push_supabase_api.py — henter siste trekning fra api.norsk-tipping.no og lagrer i Supabase.

Tidsplan: hvert spill hentes til et TILFELDIG tidspunkt innenfor sitt eget vindu,
på riktig ukedag (norsk tid), så trafikken ser sporadisk ut i stedet for maskinell.
Kjøres manuelt (workflow_dispatch) → henter alle spill med en gang, uten venting.

Miljøvariabler (GitHub Secrets): SUPABASE_URL, SUPABASE_SERVICE_KEY
"""
import os
import random
import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import requests

from api_adapter import ApiResultAdapter
from lotto_ingest import validate_draw
from site_contract import to_site_payload

OSLO = ZoneInfo("Europe/Oslo")

# Ukedag: mandag=0 ... søndag=6.  (tir=1, ons=2, fre=4, lør=5)
# Vinduer i NORSK tid. Håndterer sommer-/vintertid automatisk via ZoneInfo.
GAME_SCHEDULE = {
    "lotto":       [(5, "20:05", "20:15")],                        # lørdag
    "vikinglotto": [(2, "21:03", "21:15")],                        # onsdag
    "eurojackpot": [(1, "21:05", "21:35"), (4, "21:05", "21:35")], # tirsdag + fredag
    "joker":       [(2, "21:02", "21:12"), (5, "20:02", "20:12")], # onsdag + lørdag
}

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


def _random_target(now: datetime, start: str, end: str) -> datetime:
    sh, sm = map(int, start.split(":"))
    eh, em = map(int, end.split(":"))
    start_dt = now.replace(hour=sh, minute=sm, second=0, microsecond=0)
    end_dt = now.replace(hour=eh, minute=em, second=0, microsecond=0)
    span = max(int((end_dt - start_dt).total_seconds()), 0)
    return start_dt + timedelta(seconds=random.randint(0, span))


def jobs_for(now: datetime) -> list[tuple[str, datetime]]:
    """Spill som skal hentes i dag, hver med sitt tilfeldige måltidspunkt."""
    wd = now.weekday()
    jobs = []
    for game, windows in GAME_SCHEDULE.items():
        for (day, start, end) in windows:
            if day == wd:
                jobs.append((game, _random_target(now, start, end)))
    jobs.sort(key=lambda j: j[1])   # kronologisk rekkefølge
    return jobs


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


def harvest(game: str, adapter: ApiResultAdapter) -> None:
    try:
        result = adapter.fetch(game)
    except Exception as e:  # noqa
        print(f"[SKIP] {game}: henting feilet: {e}")
        return
    errors = [e for e in validate_draw(result) if not e.startswith("MERK:")]
    if errors:
        print(f"[SKIP] {game}: {errors}")
        return
    payload = to_site_payload(result)
    upsert_draw({"game": payload["game"], "draw_date": payload["drawDateIso"], "payload": payload})
    print(f"[OK] {game} {payload['drawDateIso']} lagret")


def main() -> None:
    adapter = ApiResultAdapter()
    manual = os.environ.get("GITHUB_EVENT_NAME") == "workflow_dispatch"

    if manual:
        print("Manuell kjøring — henter alle spill nå (ingen venting).")
        for game in GAME_SCHEDULE:
            harvest(game, adapter)
        return

    jobs = jobs_for(datetime.now(OSLO))
    if not jobs:
        print("Ingen trekninger i dag — ingenting å hente.")
        return

    for game, target in jobs:
        wait = (target - datetime.now(OSLO)).total_seconds()
        if wait > 0:
            print(f"Venter til {target.strftime('%H:%M:%S')} norsk for {game} ({int(wait)}s) ...")
            time.sleep(wait)
        harvest(game, adapter)


if __name__ == "__main__":
    main()
