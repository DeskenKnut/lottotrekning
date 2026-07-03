import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lottoresultater",
  description: "Siste vinnertall og premier.",
  robots: { index: false, follow: false }, // funksjonstest: hold ute av søk
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
