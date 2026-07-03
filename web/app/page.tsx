import Link from "next/link";

const GAMES = [
  { slug: "lotto", label: "Lotto" },
  { slug: "vikinglotto", label: "Vikinglotto" },
  { slug: "eurojackpot", label: "Eurojackpot" },
  { slug: "joker", label: "Joker" },
];

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto", padding: 40 }}>
      <h1 style={{ fontFamily: "Georgia, serif" }}>Lottotrekning</h1>
      <p>Funksjonstest. Velg et spill:</p>
      <ul style={{ lineHeight: 2 }}>
        {GAMES.map((g) => (
          <li key={g.slug}><Link href={`/${g.slug}`}>{g.label}</Link></li>
        ))}
      </ul>
    </main>
  );
}
