"""
Demo: kjør hele live-kjeden (kilde → parser → validering → payload).

Miljøet her er uten nett, så vi bruker FileSource som stedfortreder for den
ekte kilden. Bytt til BrowserHtmlSource i deres miljø for live henting —
det er den eneste linjen som endres.
"""
import json
from harvest import harvest_html
from sources import FileSource   # , BrowserHtmlSource

# --- Kildevalg ---
# LIVE i deres miljø:
#   source = BrowserHtmlSource()          # Playwright rendrer SPA-en
# HER (uten nett): stedfortreder fra fil
source = FileSource({"lotto": "/mnt/user-data/uploads/lotto.txt"})

h = harvest_html("lotto", source)

print("=" * 60)
print(f"HARVEST: {h.game}   ok={h.ok}")
print("=" * 60)
if h.errors:
    print("Feil:")
    for e in h.errors:
        print("  ✗", e)
if h.warnings:
    print("Advarsler:")
    for w in h.warnings:
        print("  ⚠", w)

if h.ok:
    print("\nKlar til publisering. Payload til frontend:")
    print(json.dumps(h.payload, ensure_ascii=False, indent=2))
else:
    print("\nIkke publiser → eskaler til admin (Fase1-pipeline seksjon 5).")
