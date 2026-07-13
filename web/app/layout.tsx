import "./globals.css";
import Script from "next/script";

// Annonser er PÅ kun når miljøvariabelen NEXT_PUBLIC_ADS_ENABLED = "true".
// Hold den AV (usatt) på testdomenet. Sett den til "true" i Vercel når du går
// live på lottoresultater.no — da lastes AdSense og auto-annonser slår inn.
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
const ADS_CLIENT = "ca-pub-7026592530077937";

export const metadata = {
  title: "Lottoresultater — resultater",
  description: "Vinnertall og premier fra norske lottospill.",
  // NOINDEX mens dette er en funksjonstest. Fjern når dere går live på hoveddomenet.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        {children}
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
