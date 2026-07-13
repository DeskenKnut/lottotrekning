import "./globals.css";
import Script from "next/script";

// Annonser er PÅ når NEXT_PUBLIC_ADS_ENABLED = "true" (satt i Vercel ved lansering).
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
const ADS_CLIENT = "ca-pub-7026592530077937";
const GA_ID = "G-0VVWYF9YRG";

// EØS + Storbritannia + Sveits: samtykke kreves. Standard = avslått til brukeren
// velger i samtykkeboksen (Googles CMP oppdaterer valget). Alle andre: tillatt.
const CONSENT_REGIONS = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH",
];

export const metadata = {
  title: "Lottoresultater — siste vinnertall og trekning",
  description: "Vinnertall, trekninger og premier fra norske lottospill. Oppdateres automatisk.",
  // Ingen noindex: siden er åpen for søkemotorer.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        {/* Consent Mode v2 — MÅ kjøre før Google-tagger. Base = tillatt; EØS/UK/CH = avslått til samtykke. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted'
            });
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              region: ${JSON.stringify(CONSENT_REGIONS)},
              wait_for_update: 500
            });
          `}
        </Script>

        {children}

        {/* Google Analytics 4 — respekterer Consent Mode / Googles CMP */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>

        {/* Google AdSense auto-annonser */}
        {ADS_ENABLED && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`}
          />
        )}
      </body>
    </html>
  );
}
