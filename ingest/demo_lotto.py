"""Demo: kjør HTML-adapteren mot ekte /lotteri/lotto/resultater-HTML og valider."""
from lotto_ingest import HtmlResultAdapter, validate_draw, DrawResult

HTML_PATH = "/mnt/user-data/uploads/lotto.txt"


def show(r: DrawResult) -> None:
    print(f"Spill:        {r.game}")
    print(f"Dato:         {r.draw_date}  (rå: '{r.draw_date_raw}')")
    print(f"Kilde:        {r.source}")
    print(f"Tall:         {r.numbers}")
    print("Premietabell:")
    for t in r.prize_tiers:
        kr = f"{t.amount_kr:,} kr".replace(",", " ") if t.amount_kr is not None else "—"
        print(f"   {t.name:12s}  {t.winners:>8,} vinnere   {kr}".replace(",", " "))
    print("Førstepremievinnere:")
    for w in r.first_prize_winners:
        print(f"   {w.description:8s} {w.county}")
    to = f"{r.turnover_kr:,} kr".replace(",", " ") if r.turnover_kr else "—"
    print(f"Omsetning:    {to}")


def main() -> None:
    html = open(HTML_PATH, encoding="utf-8").read()
    adapter = HtmlResultAdapter(html)
    # Datoteksten mangler år; vi vet trekningen er fra 2026.
    result = adapter.fetch("lotto", assume_year=2026)

    print("=" * 60)
    print("UTTREKK FRA EKTE HTML")
    print("=" * 60)
    show(result)

    print("\n" + "=" * 60)
    print("VALIDERING")
    print("=" * 60)
    errors = validate_draw(result)
    if errors:
        for e in errors:
            print("  ✗", e)
    else:
        print("  ✓ Gyldig — alle strukturregler oppfylt")

    # Vis at validatoren fanger feil: injiser et ugyldig tall
    print("\n" + "=" * 60)
    print("VALIDERING FANGER FEIL (negativ test)")
    print("=" * 60)
    bad = DrawResult(game="LOTTO", draw_date=result.draw_date,
                     numbers={"hovedtall": [5, 6, 7, 20, 25, 28, 99],  # 99 utenfor 1–34
                              "tilleggstall": [5]})                    # kolliderer med hovedtall
    for e in validate_draw(bad):
        print("  ✗", e)


if __name__ == "__main__":
    main()
