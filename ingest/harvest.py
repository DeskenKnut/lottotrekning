"""
harvest — orkestrerer én innhenting: kilde → parser → validering → payload.

Kilde-agnostisk: bytt FileSource mot BrowserHtmlSource (live) eller en
ApiResultAdapter uten å endre resten. Returnerer et strukturert resultat som
publiseringslaget og eskaleringen (Fase1-pipeline seksjon 5) bygger på.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from lotto_ingest import DrawResult, HtmlResultAdapter, validate_draw
from site_contract import to_site_payload
from sources import HtmlSource


@dataclass
class Harvest:
    game: str
    ok: bool                              # gyldig nok til å publisere?
    result: DrawResult | None = None
    errors: list[str] = field(default_factory=list)      # harde feil
    warnings: list[str] = field(default_factory=list)     # f.eks. uverifisert spec
    payload: dict | None = None


def harvest_html(game: str, source: HtmlSource) -> Harvest:
    """Hent + parse + valider + bygg payload for ett spill fra en HTML-kilde."""
    try:
        html = source.get_html(game)
    except Exception as e:  # noqa
        return Harvest(game=game.upper(), ok=False, errors=[f"Henting feilet: {e}"])

    result = HtmlResultAdapter(html).fetch(game)   # år utledes automatisk
    issues = validate_draw(result)

    # Skill "MERK:"-notater (uverifisert spec) fra harde valideringsfeil.
    warnings = [e for e in issues if e.startswith("MERK:")]
    errors = [e for e in issues if not e.startswith("MERK:")]
    ok = not errors and bool(result.numbers.get("hovedtall"))

    return Harvest(
        game=result.game,
        ok=ok,
        result=result,
        errors=errors,
        warnings=warnings,
        payload=to_site_payload(result) if ok else None,
    )
