"""
sources — live-hentingslag for innhentingspipelinen.

Skiller HENTING fra PARSING: en Source leverer ferdig HTML (eller JSON), og
lotto_ingest-adapteren tolker den. Da kan parseren enhetstestes rent, og den
juridisk følsomme nettverksdelen (robots/vilkår, jf. Tillegg C) er samlet her.

Kilder:
  FileSource        – lokal fil (stedfortreder for test uten nett)
  RequestsHtmlSource – vanlig HTTP GET. ADVARSEL: /resultater er klient-rendret,
                       så et rått GET gir skallet UTEN tallene. Kun nyttig hvis
                       siden en dag blir server-rendret, eller for andre sider.
  BrowserHtmlSource – Playwright rendrer SPA-en → ferdig DOM med tall. Virker nå.
  ApiJsonSource     – api.norsk-tipping.no (renest). Krever endepunktstien.

Alle nettkilder bruker PoliteClient: ærlig User-Agent, rate-limit, retry og cache.
"""
from __future__ import annotations

import time
import hashlib
from abc import ABC, abstractmethod
from pathlib import Path


# ---------------------------------------------------------------------------
# Høflig klient (jf. Tillegg C.4)
# ---------------------------------------------------------------------------

class PoliteClient:
    """Rate-limit + ærlig UA + retry + enkel disk-cache. Omgår ALDRI sperrer:
    blir vi blokkert, er det et signal om å søke avtale, ikke å evade."""

    def __init__(self,
                 user_agent: str = "lottoresultater.no-bot/1.0 (+kontakt@lottoresultater.no)",
                 min_interval_s: float = 5.0,
                 timeout_s: float = 15.0,
                 retries: int = 3,
                 cache_dir: str | None = "/tmp/nt-cache",
                 cache_ttl_s: int = 300):
        self.user_agent = user_agent
        self.min_interval_s = min_interval_s
        self.timeout_s = timeout_s
        self.retries = retries
        self.cache_dir = Path(cache_dir) if cache_dir else None
        self.cache_ttl_s = cache_ttl_s
        self._last_request = 0.0
        if self.cache_dir:
            self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _cache_path(self, url: str) -> Path | None:
        if not self.cache_dir:
            return None
        return self.cache_dir / (hashlib.sha256(url.encode()).hexdigest() + ".cache")

    def get(self, url: str) -> str:
        # cache
        cp = self._cache_path(url)
        if cp and cp.exists() and (time.time() - cp.stat().st_mtime) < self.cache_ttl_s:
            return cp.read_text(encoding="utf-8")

        import requests  # lazy: modulen importeres selv uten requests installert

        # rate-limit
        gap = time.time() - self._last_request
        if gap < self.min_interval_s:
            time.sleep(self.min_interval_s - gap)

        last_err = None
        for attempt in range(self.retries):
            try:
                resp = requests.get(url, headers={"User-Agent": self.user_agent},
                                    timeout=self.timeout_s)
                self._last_request = time.time()
                resp.raise_for_status()
                if cp:
                    cp.write_text(resp.text, encoding="utf-8")
                return resp.text
            except Exception as e:  # noqa
                last_err = e
                time.sleep(2 ** attempt)  # eksponentiell backoff
        raise RuntimeError(f"Henting feilet etter {self.retries} forsøk: {last_err}")


# ---------------------------------------------------------------------------
# Kilde-abstraksjon
# ---------------------------------------------------------------------------

RESULT_URL = "https://www.norsk-tipping.no/lotteri/{game}/resultater"


class HtmlSource(ABC):
    """Leverer ferdig (rendret) HTML for et spill."""
    @abstractmethod
    def get_html(self, game: str) -> str: ...


class FileSource(HtmlSource):
    """Lokal fil — stedfortreder for test uten nett."""
    def __init__(self, path_for: dict[str, str]):
        self.path_for = {k.lower(): v for k, v in path_for.items()}

    def get_html(self, game: str) -> str:
        return Path(self.path_for[game.lower()]).read_text(encoding="utf-8")


class RequestsHtmlSource(HtmlSource):
    """Vanlig HTTP GET.

    ADVARSEL: /resultater er klient-rendret; et rått GET returnerer SPA-skallet
    UTEN vinnertallene (results.draws er tom i __PRELOADED_STATE__). Bruk
    BrowserHtmlSource eller ApiJsonSource for live tall. Beholdt her fordi den
    er riktig verktøy dersom siden blir server-rendret, eller for andre sider.
    """
    def __init__(self, client: PoliteClient | None = None):
        self.client = client or PoliteClient()

    def get_html(self, game: str) -> str:
        return self.client.get(RESULT_URL.format(game=game.lower()))


class BrowserHtmlSource(HtmlSource):
    """Playwright rendrer SPA-en og returnerer ferdig DOM (med tallene).

    Krever `pip install playwright` + `playwright install chromium`.
    Kjøres i DERES miljø (dette miljøet har ikke nett/Playwright).
    """
    def __init__(self, user_agent: str = "lottoresultater.no-bot/1.0 (+kontakt@lottoresultater.no)",
                 wait_selector: str = '[data-testid="winner-number-1"]',
                 timeout_ms: int = 20000):
        self.user_agent = user_agent
        self.wait_selector = wait_selector
        self.timeout_ms = timeout_ms

    def get_html(self, game: str) -> str:
        from playwright.sync_api import sync_playwright  # lazy
        url = RESULT_URL.format(game=game.lower())
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent=self.user_agent)
            page.goto(url, wait_until="networkidle", timeout=self.timeout_ms)
            # vent til tallene faktisk er rendret inn
            page.wait_for_selector(self.wait_selector, timeout=self.timeout_ms)
            html = page.content()
            browser.close()
            return html


class ApiJsonSource:
    """api.norsk-tipping.no — renest kilde (strukturert JSON).

    TODO(bygg): fyll inn eksakt endepunktsti. Fang den i Network-fanen på
    /resultater ved å klikke «Velg tidligere trekning» og filtrere på
    api.norsk-tipping.no. Deretter skrives en ApiResultAdapter som mapper
    JSON-feltene til DrawResult (samme grensesnitt som HtmlResultAdapter).
    """
    ENDPOINT = "https://api.norsk-tipping.no/{PATH_TBD}"  # <-- kartlegg denne

    def __init__(self, client: PoliteClient | None = None):
        self.client = client or PoliteClient()

    def get_json(self, game: str) -> dict:
        raise NotImplementedError(
            "Endepunktstien er ikke kartlagt ennå — se Network-fanen på /resultater.")
