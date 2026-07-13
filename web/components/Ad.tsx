"use client";
import { useEffect } from "react";

// Fast annonseenhet. Bruk når du har opprettet en annonseenhet i AdSense og
// fått en data-ad-slot-ID (ti siffer):  <Ad slot="1234567890" />
// Er annonser avskrudd (testdomenet), vises en diskret plassholder i stedet.
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
const ADS_CLIENT = "ca-pub-7026592530077937";

const C = { rule: "#c9c2b6", card: "#fdfcfa", meta: "#9a9186" };
const UI = "var(--font-ui, system-ui, sans-serif)";

export default function Ad({ slot, format = "auto", label = "Annonse" }: { slot: string; format?: string; label?: string }) {
  useEffect(() => {
    if (!ADS_ENABLED) return;
    try {
      // @ts-expect-error adsbygoogle er lagt på window av AdSense-skriptet
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!ADS_ENABLED) {
    return (
      <div style={{ maxWidth: 468, margin: "26px auto", border: `1px dashed ${C.rule}`, borderRadius: 2, padding: "18px 12px", textAlign: "center", background: C.card }}>
        <div style={{ fontFamily: UI, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: C.meta }}>{label}</div>
        <div style={{ fontFamily: UI, fontSize: 12, color: C.meta, marginTop: 4 }}>Annonseplass (aktiveres ved lansering)</div>
      </div>
    );
  }

  return (
    <div style={{ margin: "26px auto", textAlign: "center", maxWidth: 970 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADS_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
