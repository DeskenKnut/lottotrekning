import "./globals.css";

export const metadata = {
  title: "Lottotrekning — resultater",
  description: "Vinnertall og premier fra norske lottospill.",
  // NOINDEX mens dette er en funksjonstest. Fjern når dere går live på hoveddomenet.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
