"""
lotto_ingest — kjerne for automatisk innhenting av norske lottoresultater.

Innhold:
  - Datamodell (DrawResult, PrizeTier, FirstPrizeWinner)
  - Spillspesifikasjoner + validering (GameSpec, validate_draw)
  - Adapter-grensesnitt (ResultAdapter)
  - HTML-adapter for /{spill}/resultater (HtmlResultAdapter)

Designet er kilde-uavhengig: valideringen og modellen er de samme uansett om
tallene kommer fra api.norsk-tipping.no (JSON), HTML-parsing eller OCR. Nye
kilder implementeres bare som nye ResultAdapter-underklasser.

Kan porteres til TS/PHP, men Python er et sterkt valg for en frittstående
innhentingstjeneste (parsing- og OCR-økosystemet).
"""
from __future__ import annotations

import re
import unicodedata
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import date, datetime, timezone

from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Datamodell
# ---------------------------------------------------------------------------

@dataclass
class PrizeTier:
    """En gevinstklasse i premietabellen."""
    name: str                 # f.eks. "7 rette"
    winners: int              # antall vinnere
    amount_kr: int | None     # premie i hele kroner (None hvis ikke oppgitt)


@dataclass
class FirstPrizeWinner:
    """Vinner av førstepremiepotten (kjønn/beskrivelse + fylke)."""
    description: str          # f.eks. "Mann"
    county: str               # f.eks. "Vestland"


@dataclass
class DrawResult:
    """Ett trekningsresultat, kilde-uavhengig."""
    game: str                                   # "LOTTO", "VIKINGLOTTO", ...
    draw_date: date | None                      # trekningsdato
    numbers: dict[str, list[int]]               # spillspesifikke tallgrupper
    prize_tiers: list[PrizeTier] = field(default_factory=list)
    first_prize_winners: list[FirstPrizeWinner] = field(default_factory=list)
    turnover_kr: int | None = None
    source: str = ""                            # hvilken adapter/kilde
    fetched_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    draw_date_raw: str = ""                      # rå datotekst (mangler ofte år!)


# ---------------------------------------------------------------------------
# Spillspesifikasjoner + validering
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class NumberGroup:
    key: str                      # nøkkel i DrawResult.numbers, f.eks. "hovedtall"
    count: int                    # forventet antall
    lo: int                       # laveste gyldige verdi
    hi: int                       # høyeste gyldige verdi
    unique: bool = True           # unike innen gruppen?
    distinct_from: tuple[str, ...] = ()   # må ikke overlappe disse gruppene


@dataclass(frozen=True)
class GameSpec:
    game: str
    groups: tuple[NumberGroup, ...]
    confirmed: bool = True        # False = struktur ikke verifisert mot ekte data ennå


# Verifisert mot ekte data (27. juni: 7 tall 1–34 + tilleggstall 31).
LOTTO = GameSpec("LOTTO", (
    NumberGroup("hovedtall", 7, 1, 34),
    NumberGroup("tilleggstall", 1, 1, 34, distinct_from=("hovedtall",)),
))

# Følgende er basert på kjente spilleregler, men IKKE ennå verifisert mot
# faktisk HTML/JSON. Bekreft count/range ved bygg (jf. Fase1-arkitektur, seksjon 6).
VIKINGLOTTO = GameSpec("VIKINGLOTTO", (
    NumberGroup("hovedtall", 6, 1, 48),
    NumberGroup("vikingtall", 1, 1, 5),
))  # verifisert mot ekte API-data 2026-07

EUROJACKPOT = GameSpec("EUROJACKPOT", (
    NumberGroup("hovedtall", 5, 1, 50),
    NumberGroup("stjernetall", 2, 1, 12),
), confirmed=False)

KENO = GameSpec("KENO", (
    NumberGroup("trukne", 20, 1, 70),
), confirmed=False)

# Joker er en sifferrekke (0–9). Antall siffer må bekreftes.
JOKER = GameSpec("JOKER", (
    NumberGroup("siffer", 7, 0, 9, unique=False),
), confirmed=False)

# Extra og Nabolaget har avvikende struktur (Nabolaget er område-/postnummerbasert)
# og håndteres ikke av den numeriske validatoren ennå — egne malvarianter ved bygg.

SPECS: dict[str, GameSpec] = {
    s.game: s for s in (LOTTO, VIKINGLOTTO, EUROJACKPOT, KENO, JOKER)
}


def validate_draw(result: DrawResult) -> list[str]:
    """Returnerer en liste med feil. Tom liste = gyldig."""
    errors: list[str] = []
    spec = SPECS.get(result.game)
    if spec is None:
        return [f"Ingen spesifikasjon for spill '{result.game}'"]

    expected_keys = {g.key for g in spec.groups}
    got_keys = set(result.numbers)
    for extra in got_keys - expected_keys:
        errors.append(f"Uventet tallgruppe: '{extra}'")

    for g in spec.groups:
        vals = result.numbers.get(g.key)
        if vals is None:
            errors.append(f"Mangler tallgruppe '{g.key}'")
            continue
        if len(vals) != g.count:
            errors.append(f"'{g.key}': forventet {g.count} tall, fikk {len(vals)}")
        out = [v for v in vals if not (g.lo <= v <= g.hi)]
        if out:
            errors.append(f"'{g.key}': verdier utenfor {g.lo}–{g.hi}: {out}")
        if g.unique and len(set(vals)) != len(vals):
            errors.append(f"'{g.key}': inneholder duplikater: {vals}")
        for other in g.distinct_from:
            overlap = set(vals) & set(result.numbers.get(other, []))
            if overlap:
                errors.append(f"'{g.key}' overlapper med '{other}': {sorted(overlap)}")

    if not spec.confirmed:
        errors.append(f"MERK: spesifikasjon for {spec.game} er ikke verifisert mot ekte data ennå")
    return errors


# ---------------------------------------------------------------------------
# Hjelpere: norsk tall- og datoformat
# ---------------------------------------------------------------------------

_MONTHS = {
    "januar": 1, "februar": 2, "mars": 3, "april": 4, "mai": 5, "juni": 6,
    "juli": 7, "august": 8, "september": 9, "oktober": 10, "november": 11, "desember": 12,
}


def parse_kr(text: str) -> int | None:
    """'2 730 415 kr' -> 2730415. Håner vanlige og hardt mellomrom."""
    if not text:
        return None
    cleaned = unicodedata.normalize("NFKC", text)
    cleaned = cleaned.replace("kr", "")
    cleaned = re.sub(r"[^\d]", "", cleaned)
    return int(cleaned) if cleaned else None


def parse_norwegian_date(text: str, assume_year: int | None = None,
                         today: date | None = None) -> tuple[date | None, str]:
    """
    'lørdag 27. juni' -> date. VIKTIG: datoteksten mangler år!
    Uten assume_year utledes det nyeste året der (dag, måned) <= i dag,
    slik at siste trekning får riktig fjorår rundt årsskiftet.
    Returnerer (date|None, rå-tekst).
    """
    raw = (text or "").strip()
    m = re.search(r"(\d{1,2})\.?\s+([a-zæøå]+)", raw.lower())
    if not m:
        return None, raw
    day = int(m.group(1))
    month = _MONTHS.get(m.group(2))
    if not month:
        return None, raw
    if assume_year is not None:
        try:
            return date(assume_year, month, day), raw
        except ValueError:
            return None, raw
    today = today or date.today()
    year = today.year
    try:
        d = date(year, month, day)
    except ValueError:
        return None, raw
    if d > today:                 # datoen ligger fram i tid -> må være i fjor
        d = date(year - 1, month, day)
    return d, raw


# ---------------------------------------------------------------------------
# Adapter-grensesnitt
# ---------------------------------------------------------------------------

class ResultAdapter(ABC):
    """Felles grensesnitt for alle kilder (HTML, api.norsk-tipping.no, OCR ...)."""
    name: str = "abstract"

    @abstractmethod
    def fetch(self, game: str, *, assume_year: int | None = None) -> DrawResult:
        ...


class HtmlResultAdapter(ResultAdapter):
    """
    Parser den server-rendrede /{spill}/resultater-siden.
    Bruker de stabile data-testid-krokene NT selv legger inn.

    Merk: nettverkshenting (høflig klient, rate-limit, robots/vilkår, jf.
    Tillegg C) skjer i en egen fetch-funksjon; her tar vi HTML-en som input
    slik at parseren er ren og enhetstestbar.
    """
    name = "html:/resultater"

    def __init__(self, html: str):
        self.soup = BeautifulSoup(html, "html.parser")

    def _testid(self, tid: str):
        return self.soup.find(attrs={"data-testid": tid})

    def _numbers(self) -> dict[str, list[int]]:
        # Hovedtall: data-testid="winner-number-N"
        main: list[int] = []
        i = 1
        while (el := self._testid(f"winner-number-{i}")) is not None:
            main.append(int(el.get_text(strip=True)))
            i += 1
        numbers = {"hovedtall": main}

        # Tilleggstall: ballen(e) rett etter <h2>Tilleggstall</h2>
        add_header = self.soup.find(
            lambda t: t.name in ("h2", "h3") and "Tilleggstall" in t.get_text())
        if add_header:
            ul = add_header.find_next("ul")
            if ul:
                extra = [int(s.get_text(strip=True))
                         for s in ul.find_all("span")
                         if s.get_text(strip=True).isdigit()]
                if extra:
                    numbers["tilleggstall"] = extra
        return numbers

    def _prize_tiers(self) -> list[PrizeTier]:
        tiers: list[PrizeTier] = []
        i = 0
        while (name_el := self._testid(f"prize-name-{i}")) is not None:
            row = name_el.find_parent("tr")
            winners = None
            if row:
                tds = row.find_all("td")
                if len(tds) >= 2:
                    w = re.sub(r"[^\d]", "", tds[1].get_text())
                    winners = int(w) if w else None
            val_el = self._testid(f"prize-value-{i}")
            tiers.append(PrizeTier(
                name=name_el.get_text(strip=True),
                winners=winners if winners is not None else 0,
                amount_kr=parse_kr(val_el.get_text()) if val_el else None,
            ))
            i += 1
        return tiers

    def _first_prize_winners(self) -> list[FirstPrizeWinner]:
        cap = self.soup.find(
            lambda t: t.name == "caption" and "førstepremiepott" in t.get_text().lower())
        winners: list[FirstPrizeWinner] = []
        if cap:
            table = cap.find_parent("table")
            body = table.find("tbody") if table else None
            if body:
                for tr in body.find_all("tr"):
                    tds = tr.find_all("td")
                    if len(tds) >= 2:
                        winners.append(FirstPrizeWinner(
                            description=tds[0].get_text(strip=True),
                            county=tds[1].get_text(" ", strip=True),
                        ))
        return winners

    def _turnover(self) -> int | None:
        el = self.soup.find(string=re.compile(r"Omsetning"))
        return parse_kr(el) if el else None

    def fetch(self, game: str, *, assume_year: int | None = None) -> DrawResult:
        date_el = self._testid("draw-date")
        draw_date, raw = parse_norwegian_date(
            date_el.get_text(strip=True) if date_el else "", assume_year=assume_year)
        return DrawResult(
            game=game.upper(),
            draw_date=draw_date,
            draw_date_raw=raw,
            numbers=self._numbers(),
            prize_tiers=self._prize_tiers(),
            first_prize_winners=self._first_prize_winners(),
            turnover_kr=self._turnover(),
            source=self.name,
        )
