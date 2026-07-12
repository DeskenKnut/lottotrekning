"""
site_contract — oversetter parserens DrawResult til datakontrakten frontend bruker.

Dette er limet i integrasjonstesten: innhentingssiden (lotto_ingest) og
design-malen møtes på én veldefinert JSON-form. Malens README ("Data
Requirements") ber om nøyaktig dette:
  - drawDateLabel + drawDateIso
  - mainNumbers[], bonusNumbers[], bonusLabel
  - prizeTiers i visningsrekkefølge: {label, amount|null, jackpot}
  - countOrder: rekkefølge for count-up-animasjonen (stigende beløp, jackpot sist)
  - nextDraw: ukedag + time for nedtellingen
"""
from __future__ import annotations

import json
from datetime import date

from lotto_ingest import DrawResult, HtmlResultAdapter

# Norsk ukedag/måned for etikett
_WD = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"]
_MO = ["", "januar", "februar", "mars", "april", "mai", "juni",
       "juli", "august", "september", "oktober", "november", "desember"]

# Per spill: bonus-etikett + hovedtall-gruppe + neste-trekning-plan (ukedag, time).
# NB: trekningstider her følger malens spec; rekonsiler mot faktiske NT-tider ved bygg.
GAME_CONFIG = {
    "LOTTO":       {"bonus_key": "tilleggstall", "bonus_label": "Tilleggstall:",
                    "next_draw": {"weekday": 5, "hour": 19}},   # lørdag
    "VIKINGLOTTO": {"bonus_key": "vikingtall",   "bonus_label": "Vikingtall:",
                    "next_draw": {"weekday": 2, "hour": 18}},   # onsdag
    "EUROJACKPOT": {"bonus_key": "stjernetall",  "bonus_label": "Stjernetall:",
                    "next_draw": {"weekday": 4, "hour": 21}},   # fredag
    "JOKER":       {"bonus_key": None,           "bonus_label": None,
                    "next_draw": {"weekday": 5, "hour": 19}},
}


def date_label(d: date | None) -> str:
    if not d:
        return ""
    return f"{_WD[d.weekday()]} {d.day}. {_MO[d.month]} {d.year}"


def to_site_payload(result: DrawResult) -> dict:
    cfg = GAME_CONFIG.get(result.game, {})
    bonus_key = cfg.get("bonus_key")

    tiers = [
        {"label": t.name.strip(),
         "amount": t.amount_kr,
         "jackpot": t.amount_kr is None}
        for t in result.prize_tiers
    ]
    # count-up rekkefølge: stigende beløp, jackpot (amount None) sist
    count_order = sorted(
        range(len(tiers)),
        key=lambda i: (tiers[i]["amount"] is None, tiers[i]["amount"] or 0),
    )

    return {
        "game": result.game,
        "drawDateLabel": date_label(result.draw_date),
        "drawDateIso": result.draw_date.isoformat() if result.draw_date else None,
        "mainNumbers": result.numbers.get("hovedtall") or result.numbers.get("siffer") or [],
        "bonusNumbers": result.numbers.get(bonus_key, []) if bonus_key else [],
        "bonusLabel": cfg.get("bonus_label"),
        "prizeTiers": tiers,
        "countOrder": count_order,
        "nextDraw": cfg.get("next_draw"),
        "turnoverKr": result.turnover_kr,
        "source": result.source,
    }


if __name__ == "__main__":
    html = open("/mnt/user-data/uploads/lotto.txt", encoding="utf-8").read()
    result = HtmlResultAdapter(html).fetch("lotto", assume_year=2026)
    payload = to_site_payload(result)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
