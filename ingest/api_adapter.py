"""
api_adapter — henter resultater direkte fra Norsk Tippings JSON-API.
Oppdaget endepunkt: https://api.norsk-tipping.no/LotteryGameInfo/v2/api/results/{game}?fromDate=...&toDate=...
Returnerer strukturert JSON → ingen Playwright, ingen HTML-parsing.
"""
from __future__ import annotations
from datetime import date, timedelta

from lotto_ingest import DrawResult, PrizeTier, ResultAdapter

# Hvilken tallgruppe "type 2" (bonus) mapper til, per spill
BONUS_KEY = {
    "LOTTO": "tilleggstall",
    "VIKINGLOTTO": "vikingtall",
    "EUROJACKPOT": "stjernetall",
}

# API-et bruker andre navn enn nettsidens slugs (noen har " all" bak seg)
API_GAME_NAME = {
    "lotto": "lotto",
    "vikinglotto": "vikinglotto",
    "eurojackpot": "eurojackpot all",
    "joker": "joker all",
}

def _to_int(s):
    if s is None or s == "":
        return None
    return int(float(s))   # takler "58159328" og "5.8159328E7"

def parse_api_draw(game: str, d: dict) -> DrawResult:
    game = game.upper()
    if game == "JOKER":
        # Joker er en sifferrekke — behold trukket rekkefølge (IKKE sorter)
        seq = [w for w in d["winnerNumber"] if w.get("type") == 1]
        seq.sort(key=lambda w: w.get("drawOrder", 0))
        numbers = {"siffer": [int(w["number"]) for w in seq]}
    else:
        main = sorted(int(w["number"]) for w in d["winnerNumber"] if w.get("type") == 1)
        bonus = sorted(int(w["number"]) for w in d["winnerNumber"] if w.get("type") == 2)
        numbers = {"hovedtall": main}
        bkey = BONUS_KEY.get(game)
        if bonus and bkey:
            numbers[bkey] = bonus

    tiers = []
    for p in d.get("prize", []):
        jackpot = _to_int(p.get("jackpotAmount", 0)) or 0
        value = _to_int(p.get("value"))
        tiers.append(PrizeTier(
            name=p["name"],
            winners=_to_int(p.get("winners")) or 0,
            amount_kr=None if jackpot > 0 else value,   # jackpot-rad -> None
        ))

    return DrawResult(
        game=game,
        draw_date=date.fromisoformat(d["drawDate"][:10]),
        numbers=numbers,
        prize_tiers=tiers,
        turnover_kr=_to_int(d.get("turnover")),
        source="api:LotteryGameInfo",
    )

def parse_api_results(game: str, data: dict) -> list[DrawResult]:
    draws = [parse_api_draw(game, d) for d in data.get("gameResult", []) if d.get("isFinalized")]
    return sorted(draws, key=lambda r: r.draw_date, reverse=True)


class ApiResultAdapter(ResultAdapter):
    """Henter siste trekning direkte fra api.norsk-tipping.no (JSON). Ingen nettleser."""
    name = "api:LotteryGameInfo"
    BASE = "https://api.norsk-tipping.no/LotteryGameInfo/v2/api/results/{game}"

    def __init__(self, client=None, weeks: int = 15):
        from sources import PoliteClient
        self.client = client or PoliteClient()
        self.weeks = weeks

    def fetch(self, game: str, **_) -> DrawResult:
        import json
        today = date.today()
        frm = (today - timedelta(weeks=self.weeks)).isoformat()
        to = (today + timedelta(days=1)).isoformat()
        from urllib.parse import quote
        api_name = API_GAME_NAME.get(game.lower(), game.lower())
        url = self.BASE.format(game=quote(api_name)) + f"?fromDate={frm}&toDate={to}"
        data = json.loads(self.client.get(url))
        draws = parse_api_results(game, data)
        if not draws:
            raise RuntimeError(f"Ingen ferdigstilte trekninger for {game}")
        return draws[0]  # nyeste

    def fetch_all(self, game: str) -> list[DrawResult]:
        """Hele perioden (til historisk arkiv). Bruk bevisst, jf. Tillegg C."""
        import json
        today = date.today()
        frm = (today - timedelta(weeks=self.weeks)).isoformat()
        to = (today + timedelta(days=1)).isoformat()
        from urllib.parse import quote
        api_name = API_GAME_NAME.get(game.lower(), game.lower())
        url = self.BASE.format(game=quote(api_name)) + f"?fromDate={frm}&toDate={to}"
        return parse_api_results(game, json.loads(self.client.get(url)))
